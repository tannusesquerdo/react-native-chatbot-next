import React, { cloneElement, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ChatBotProps } from './types/props';
import type { RenderedStep, Step, StepId } from './types/steps';
import { Bubble } from './components/Bubble';
import { InputBar } from './components/InputBar';
import { Options } from './components/Options';
import { createStepMap, isCustomStep, isOptionsStep, isTextStep, isUpdateStep, isUserStep, stepKey } from './engine/stepResolver';
import { nextStepId } from './engine/triggerResolver';
import { resolveStepDelay } from './engine/delayResolver';
import { applyUpdateStep, createEndPayload, toRenderedMap } from './engine/runtimeState';

function toRendered(step: Step, steps: Record<string, RenderedStep>, previousValue?: unknown): RenderedStep {
  if (isTextStep(step)) {
    const message = typeof step.message === 'function' ? step.message({ previousValue, steps }) : step.message;
    return { id: step.id, message, metadata: step.metadata };
  }

  if (isUserStep(step)) {
    return { id: step.id, user: true, metadata: step.metadata };
  }

  if (isOptionsStep(step)) {
    return { id: step.id, options: step.options, metadata: step.metadata };
  }

  if (isCustomStep(step)) {
    return { id: step.id, component: step.component, metadata: step.metadata };
  }

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
    optionStyle,
    optionElementStyle,
    optionFontColor,
    optionBubbleColor,
    footerStyle,
    inputStyle,
    submitButtonContent,
    submitButtonStyle,
    scrollViewProps,
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

  const currentRendered = renderedSteps[renderedSteps.length - 1];
  const currentStep = currentRendered ? stepMap[stepKey(currentRendered.id)] : undefined;

  const finish = (finalRendered = renderedSteps) => {
    handleEnd?.(createEndPayload(finalRendered, values));
  };

  const goTo = (id: StepId | undefined, value?: unknown) => {
    if (id === undefined) {
      finish();
      return;
    }

    const next = stepMap[stepKey(id)];
    if (!next) return;

    if (isUpdateStep(next)) {
      setRenderedSteps((prev) => applyUpdateStep(prev, next.update));
      const updateNextId = nextStepId(next, { value, steps: renderedById });
      goTo(updateNextId, value);
      return;
    }

    const rendered = toRendered(next, renderedById, value);
    const delay = resolveStepDelay(next, { botDelay, userDelay, customDelay });

    setTimeout(() => {
      setRenderedSteps((prev) => {
        const merged = [...prev, rendered];

        if (isCustomStep(next) && !next.waitAction) {
          const resolved = nextStepId(next, { value, steps: renderedById });
          if (resolved === undefined || next.end) {
            finish(merged);
          } else {
            goTo(resolved, value);
          }
        }

        if (!isUserStep(next) && !isOptionsStep(next) && !isCustomStep(next)) {
          const resolvedNext = nextStepId(next, { value, steps: renderedById });
          if (next.end || resolvedNext === undefined) {
            finish(merged);
          } else {
            goTo(resolvedNext, value);
          }
        }

        return merged;
      });
    }, delay);
  };

  const handleUserSubmit = (input: string) => {
    if (!currentStep || !isUserStep(currentStep)) return;

    const validation = currentStep.validator?.(input);
    if (validation !== undefined && validation !== true) {
      return;
    }

    const userEcho: RenderedStep = { id: `${currentStep.id}-value`, message: input, value: input };
    const nextId = nextStepId(currentStep, { value: input, steps: renderedById });

    setValues((prev) => [...prev, input]);
    setRenderedSteps((prev) => [...prev, userEcho]);
    goTo(nextId, input);
  };

  const handleOptionSelect = (value: unknown, trigger: StepId, label: string) => {
    setValues((prev) => [...prev, value]);
    const userEcho: RenderedStep = { id: `${String(trigger)}-option-value`, message: label, value };
    setRenderedSteps((prev) => [...prev, userEcho]);
    goTo(trigger, value);
  };

  const triggerNextStep = ({ value, trigger }: { value?: unknown; trigger?: StepId } = {}) => {
    const derived = trigger ?? (currentStep ? nextStepId(currentStep, { value, steps: renderedById }) : undefined);
    if (value !== undefined) {
      setValues((prev) => [...prev, value]);
    }
    goTo(derived, value);
  };

  return (
    <View style={[styles.container, style]}>
      {headerComponent}
      <ScrollView style={[styles.content, contentStyle]} {...(scrollViewProps as object)}>
        {renderedSteps.map((step, idx) => {
          const fullStep = stepMap[stepKey(step.id)];

          if (step.message) {
            const isUser = String(step.id).includes('-value');
            return (
              <Bubble
                key={`${String(step.id)}-${idx}`}
                text={step.message}
                isUser={isUser}
                style={isUser ? userBubbleStyle : bubbleStyle}
                botBubbleColor={botBubbleColor}
                userBubbleColor={userBubbleColor}
                botFontColor={botFontColor}
                userFontColor={userFontColor}
                avatarUri={isUser ? userAvatar : (isTextStep(fullStep as Step) ? (fullStep as any).avatar ?? botAvatar : botAvatar)}
                hideAvatar={isUser ? hideUserAvatar : false}
                avatarStyle={avatarStyle}
                avatarWrapperStyle={avatarWrapperStyle}
              />
            );
          }

          if (step.options) {
            return (
              <Options
                key={`${String(step.id)}-${idx}`}
                options={step.options}
                onSelect={(option) => handleOptionSelect(option.value, option.trigger, option.label)}
                optionStyle={optionStyle}
                optionElementStyle={optionElementStyle}
                optionFontColor={optionFontColor}
                optionBubbleColor={optionBubbleColor}
              />
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
                <View key={`${String(step.id)}-${idx}`} style={styles.customAsMessage}>
                  {enhanced}
                </View>
              );
            }

            if (isCustom && fullStep.replace) {
              return <React.Fragment key={`${String(step.id)}-${idx}`}>{enhanced}</React.Fragment>;
            }

            return <View key={`${String(step.id)}-${idx}`}>{enhanced}</View>;
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
        />
      ) : null}
    </View>
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
