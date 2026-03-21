import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import type { ChatBotProps } from './types/props';
import type { RenderedStep, Step, StepId } from './types/steps';
import { Bubble } from './components/Bubble';
import { InputBar } from './components/InputBar';
import { Options } from './components/Options';
import { createStepMap, isCustomStep, isOptionsStep, isTextStep, isUpdateStep, isUserStep, stepKey } from './engine/stepResolver';
import { nextStepId } from './engine/triggerResolver';

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
  } = props;

  const stepMap = useMemo(() => createStepMap(steps), [steps]);
  const firstStepId = steps[0]?.id;

  const [renderedSteps, setRenderedSteps] = useState<RenderedStep[]>(() => {
    if (firstStepId === undefined) return [];
    const first = stepMap[stepKey(firstStepId)];
    return first ? [toRendered(first, {})] : [];
  });

  const [values, setValues] = useState<unknown[]>([]);

  const renderedById = useMemo(() => {
    return renderedSteps.reduce<Record<string, RenderedStep>>((acc, s) => {
      acc[stepKey(s.id)] = s;
      return acc;
    }, {});
  }, [renderedSteps]);

  const currentRendered = renderedSteps[renderedSteps.length - 1];
  const currentStep = currentRendered ? stepMap[stepKey(currentRendered.id)] : undefined;

  const goTo = (id: StepId | undefined, value?: unknown) => {
    if (id === undefined) {
      handleEnd?.({ renderedSteps, steps: renderedById, values });
      return;
    }

    const next = stepMap[stepKey(id)];
    if (!next) return;

    if (isUpdateStep(next)) {
      const targetKey = stepKey(next.update);
      setRenderedSteps((prev) => prev.filter((s) => stepKey(s.id) !== targetKey));
      const updateNextId = nextStepId(next, { value, steps: renderedById });
      goTo(updateNextId, value);
      return;
    }

    const rendered = toRendered(next, renderedById, value);
    setRenderedSteps((prev) => [...prev, rendered]);

    if (!isUserStep(next) && !isOptionsStep(next) && !isCustomStep(next)) {
      const resolvedNext = nextStepId(next, { value, steps: renderedById });
      if (next.end || resolvedNext === undefined) {
        handleEnd?.({ renderedSteps: [...renderedSteps, rendered], steps: { ...renderedById, [stepKey(rendered.id)]: rendered }, values });
      }
    }
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

  const handleOptionSelect = (value: unknown, trigger: StepId) => {
    setValues((prev) => [...prev, value]);
    const userEcho: RenderedStep = { id: `${String(trigger)}-option-value`, message: String(value), value };
    setRenderedSteps((prev) => [...prev, userEcho]);
    goTo(trigger, value);
  };

  return (
    <View style={[styles.container, style]}>
      {headerComponent}
      <ScrollView style={[styles.content, contentStyle]} {...(scrollViewProps as object)}>
        {renderedSteps.map((step, idx) => {
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
              />
            );
          }

          if (step.options) {
            return (
              <Options
                key={`${String(step.id)}-${idx}`}
                options={step.options}
                onSelect={(option) => handleOptionSelect(option.value, option.trigger)}
                optionStyle={optionStyle}
                optionElementStyle={optionElementStyle}
                optionFontColor={optionFontColor}
                optionBubbleColor={optionBubbleColor}
              />
            );
          }

          if (step.component) {
            return <View key={`${String(step.id)}-${idx}`}>{step.component}</View>;
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
});
