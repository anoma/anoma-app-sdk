import { ApiClient } from "./ApiClient";

const FEEDBACK_PROJECT = "anoma-pay";

const FeedbackPaths = {
  Submit: "/api/v1/feedbacks",
} as const;

type FeedbackRequest = {
  title: string;
  description: string;
  project: string;
  tags: string[];
  metadata: Record<string, string>;
};

type FeedbackResponse = {
  id: string;
};

/** API client for the feedback service. */
export class FeedbackClient extends ApiClient<
  (typeof FeedbackPaths)[keyof typeof FeedbackPaths]
> {
  /** Submit user feedback. */
  async submit(params: {
    title: string;
    description: string;
    tag: string;
  }): Promise<FeedbackResponse> {
    return this.post<FeedbackRequest, FeedbackResponse>(FeedbackPaths.Submit, {
      title: params.title,
      description: params.description,
      project: FEEDBACK_PROJECT,
      tags: [params.tag],
      metadata: {},
    });
  }
}
