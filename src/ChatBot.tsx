import React, { cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import { KeyboardAvoidingView, LayoutAnimation, Platform, ScrollView, StyleSheet, UIManager, View } from 'react-native';
import type { ChatBotProps } from './types/props';
import type { RenderedStep, Step, StepId } from './types/steps';
import { Bubble } from './components/Bubble';
import { InputBar } from './components/InputBar';
import { Options } from './components/Options';
import { AnimatedMessage } from './components/AnimatedMessage';
import { createStepMap, isCustomStep, isOptionsStep, isTextStep, isUpdateStep, isUserStep, stepKey } from './engine/stepResolver';
import { nextStepId } from './engine/triggerResolver';
import { resolveStepDelay } from './engine/delayResolver';
import { applyUpdateStep, createEndPayload, toRenderedMap } from './engine/runtimeState';
import { shouldRenderCustomStep } from './engine/customStepRules';

function toRendered(step: Step, steps: Record<string, RenderedStep>, previousValue?: unknown): RenderedStep {
  if (isTextStep(step)) {
    const message = typeof step.message === 'function' ? step.message({ previousValue, steps }) : step.message;
    return { id: step.id, message, metadata: step.metadata };
  }

  if (isUserStep(step)) return { id: step.id, user: true, metadata: step.metadata };
  if (isOptionsStep(step)) return { id: step.id, options: step.options, metadata: step.metadata };
  if (isCustomStep(step)) return { id: step.id, component: step.component, metadata: step.metadata };

  return { id: step.id, metadata: step.metadata };
}

export default function ChatBot(props: ChatBotProps) {
  const {
    steps,
    style,
    headerComponent,
    handleEnd,
    placeholder,
    bubbleStyle,
    userBubbleStyle,
    avatarStyle,
    avatarWrapperStyle,
    botAvatar,
    userAvatar,
    hideUserAvatar,
    botBubbleColor,
    userBubbleColor,
    botFontColor,
    userFontColor,
    contentStyle,
    customStyle,
    optionStyle,
    optionElementStyle,
    optionFontColor,
    optionBubbleColor,
    footerStyle,
    inputStyle,
    submitButtonContent,
    submitButtonStyle,
    scrollViewProps,
    keyboardVerticalOffset = Platform.OS === 'ios' ? 44 : 0,
    animationMode = 'layout',
    botDelay = 1000,
    userDelay = 1000,
    customDelay = 1000,
  } = props;

  const stepMap = useMemo(() => createStepMap(steps), [steps]);
  const firstStepId = steps[0]?.id;

  const [renderedSteps, setRenderedSteps] = useState<RenderedStep[]>(() => {
    if (firstStepId === undefined) return [];
    const first = stepMap[stepKey(firstStepId)];
    return first ? [toRendered(first, {})] : [];
  });
  const [values, setValues] = useState<unknown[]>([]);

  const renderedById = useMemo(() => toRenderedMap(renderedSteps), [renderedSteps]);
  const scrollRef = useRef<ScrollView>(null);
  const currentRendered = renderedSteps[renderedSteps.length - 1];
  const currentStep = currentRendered ? stepMap[stepKey(currentRendered.id)] : undefined;

  const finish = (finalRendered: RenderedStep[], finalValues: unknown[]) => {
    handleEnd?.(createEndPayload(finalRendered, finalValues));
  };

  const animateNext = () => {
    if (animationMode !== 'layout') return;
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  };

  const appendRendered = (entry: RenderedStep) => {
    const merged = [...renderedSteps, entry];
    animateNext();
    setRenderedSteps(merged);
    return merged;
  };

  const replaceRendered = (nextRendered: RenderedStep[]) => {
    animateNext();
    setRenderedSteps(nextRendered);
    return nextRendered;
  };

  const goTo = (id: StepId | undefined, value?: unknown, state?: { rendered: RenderedStep[]; values: unknown[] }) => {
    const baseRendered = state?.rendered ?? renderedSteps;
    const baseValues = state?.values ?? values;
    const baseMap = toRenderedMap(baseRendered);

    if (id === undefined) {
      finish(baseRendered, baseValues);
      return;
    }

    const next = stepMap[stepKey(id)];
    if (!next) return;

    if (isUpdateStep(next)) {
      const updated = applyUpdateStep(baseRendered, next.update);
      replaceRendered(updated);
      goTo(nextStepId(next, { value, steps: toRenderedMap(updated) }), value, { rendered: updated, values: baseValues });
      return;
    }

    const rendered = toRendered(next, baseMap, value);
    const delay = resolveStepDelay(next, { botDelay, userDelay, customDelay });

    setTimeout(() => {
      const merged = [...baseRendered, rendered];
      animateNext();
      setRenderedSteps(merged);

      const nextId = nextStepId(next, { value, steps: toRenderedMap(merged) });

      if (isUserStep(next) || isOptionsStep(next)) return;

      if (isCustomStep(next) && next.waitAction) return;

      if (next.end || nextId === undefined) {
        finish(merged, baseValues);
        return;
      }

      goTo(nextId, value, { rendered: merged, values: baseValues });
    }, delay);
  };

  const handleUserSubmit = (input: string) => {
    if (!currentStep || !isUserStep(currentStep)) return;

    const validation = currentStep.validator?.(input);
    if (validation !== undefined && validation !== true) {
      if (typeof validation === 'string') {
        appendRendered({ id: `${String(currentStep.id)}-validation`, message: validation });
      }
      return;
    }

    const nextValues = [...values, input];
    setValues(nextValues);

    const userEcho: RenderedStep = { id: `${currentStep.id}-value`, message: input, value: input };
    const merged = appendRendered(userEcho);
    const nextId = nextStepId(currentStep, { value: input, steps: toRenderedMap(merged) });
    goTo(nextId, input, { rendered: merged, values: nextValues });
  };

  const handleOptionSelect = (value: unknown, trigger: StepId, label: string) => {
    if (!currentStep || !isOptionsStep(currentStep)) return;

    const nextValues = [...values, value];
    setValues(nextValues);

    const optionsStepId = String(currentStep.id);
    const withSelected = renderedSteps.map((entry) =>
      String(entry.id) === optionsStepId ? { ...entry, value, metadata: { ...(entry.metadata ?? {}), selectedLabel: label } } : entry,
    );

    const userEcho: RenderedStep = { id: `${optionsStepId}-value`, message: label, value };
    const merged = [...withSelected, userEcho];
    animateNext();
    setRenderedSteps(merged);

    goTo(trigger, value, { rendered: merged, values: nextValues });
  };

  const triggerNextStep = ({ value, trigger }: { value?: unknown; trigger?: StepId } = {}) => {
    const nextValues = value !== undefined ? [...values, value] : values;
    if (value !== undefined) setValues(nextValues);

    const derived = trigger ?? (currentStep ? nextStepId(currentStep, { value, steps: renderedById }) : undefined);
    goTo(derived, value, { rendered: renderedSteps, values: nextValues });
  };

  const currentInputAttributes = currentStep && isUserStep(currentStep) ? currentStep.inputAttributes : undefined;

  useEffect(() => {
    if (animationMode !== 'layout') return;
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, [animationMode]);

  useEffect(() => {
    if (!steps.length) return;
    if (renderedSteps.length !== 1) return;
    const initial = stepMap[stepKey(steps[0].id)];
    if (!initial) return;
    if (isUserStep(initial) || isOptionsStep(initial) || (isCustomStep(initial) && initial.waitAction)) return;

    const nextId = nextStepId(initial, { value: undefined, steps: renderedById });
    if (initial.end || nextId === undefined) {
      finish(renderedSteps, values);
      return;
    }

    goTo(nextId, undefined, { rendered: renderedSteps, values });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <KeyboardAvoidingView
      style={[styles.container, style]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      {headerComponent}
      <ScrollView
        ref={scrollRef}
        style={[styles.content, contentStyle]}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        {...(scrollViewProps as object)}
      >
        {renderedSteps.map((step, idx) => {
          const fullStep = stepMap[stepKey(step.id)];

          if (step.message) {
            const isUser = String(step.id).includes('-value');
            return (
              <AnimatedMessage key={`${String(step.id)}-${idx}`} mode={animationMode}>
                <Bubble
                  text={step.message}
                  isUser={isUser}
                  style={isUser ? userBubbleStyle : bubbleStyle}
                  botBubbleColor={botBubbleColor}
                  userBubbleColor={userBubbleColor}
                  botFontColor={botFontColor}
                  userFontColor={userFontColor}
                  avatarUri={isUser ? userAvatar : isTextStep(fullStep as Step) ? (fullStep as any).avatar ?? botAvatar : botAvatar}
                  hideAvatar={isUser ? hideUserAvatar : false}
                  avatarStyle={avatarStyle}
                  avatarWrapperStyle={avatarWrapperStyle}
                />
              </AnimatedMessage>
            );
          }

          if (step.options) {
            return (
              <AnimatedMessage key={`${String(step.id)}-${idx}`} mode={animationMode}>
                <Options
                  options={step.options}
                  onSelect={(option) => handleOptionSelect(option.value, option.trigger, option.label)}
                  optionStyle={optionStyle}
                  optionElementStyle={optionElementStyle}
                  optionFontColor={optionFontColor}
                  optionBubbleColor={optionBubbleColor}
                />
              </AnimatedMessage>
            );
          }

          if (step.component) {
            const isCustom = fullStep && isCustomStep(fullStep);
            const previousStep = idx > 0 ? renderedSteps[idx - 1] : undefined;
            const enhanced = React.isValidElement(step.component)
              ? cloneElement(step.component, {
                  step,
                  steps: renderedById,
                  previousStep,
                  triggerNextStep,
                } as Record<string, unknown>)
              : step.component;

            if (isCustom && fullStep.asMessage) {
              return (
                <AnimatedMessage key={`${String(step.id)}-${idx}`} mode={animationMode}>
                  <View style={[styles.customAsMessage, customStyle]}>{enhanced}</View>
                </AnimatedMessage>
              );
            }

            if (!shouldRenderCustomStep(fullStep, idx, renderedSteps.length)) return null;

            return (
              <AnimatedMessage key={`${String(step.id)}-${idx}`} mode={animationMode}>
                <View style={customStyle}>{enhanced}</View>
              </AnimatedMessage>
            );
          }

          return null;
        })}
      </ScrollView>

      {currentStep && isUserStep(currentStep) ? (
        <InputBar
          placeholder={placeholder}
          onSubmit={handleUserSubmit}
          inputStyle={inputStyle}
          submitButtonStyle={submitButtonStyle}
          submitButtonContent={submitButtonContent}
          footerStyle={footerStyle}
          inputAttributes={currentInputAttributes as Record<string, unknown>}
        />
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
  },
  customAsMessage: {
    paddingHorizontal: 10,
    marginVertical: 4,
  },
});
