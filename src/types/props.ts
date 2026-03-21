import type { ReactElement } from 'react';
import type { Step, RenderedStep } from './steps';

export type ChatBotHandleEndPayload = {
  renderedSteps: RenderedStep[];
  steps: Record<string, RenderedStep>;
  values: unknown[];
};

export type ChatBotProps = {
  steps: Step[];
  placeholder?: string;
  botDelay?: number;
  userDelay?: number;
  customDelay?: number;
  headerComponent?: ReactElement;
  hideUserAvatar?: boolean;
  botBubbleColor?: string;
  userBubbleColor?: string;
  botFontColor?: string;
  userFontColor?: string;
  submitButtonContent?: string | ReactElement;
  handleEnd?: (payload: ChatBotHandleEndPayload) => void;

  // legacy style compatibility
  style?: object;
  bubbleStyle?: object;
  userBubbleStyle?: object;
  optionStyle?: object;
  optionElementStyle?: object;
  optionFontColor?: string;
  optionBubbleColor?: string;
  contentStyle?: object;
  footerStyle?: object;
  inputStyle?: object;
  submitButtonStyle?: object;
  scrollViewProps?: object;
};
