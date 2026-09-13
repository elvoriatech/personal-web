/** Recipients loaded per query when resolving a send slice. */
export const RECIPIENT_IDS_CHUNK = 200;

/** Emails per worker invocation — keep well under the Vercel function timeout. */
export const SEND_JOB_BATCH_SIZE = 25;

/** Pause between individual sends, to stay under provider rate limits. */
export const SEND_DELAY_MS = 900;

/** Client poll interval while a job is running. */
export const SEND_JOB_POLL_MS = 3000;

/** Admin list page size, and the sizes the table offers. */
export const RECIPIENTS_PAGE_SIZE = 25;
export const RECIPIENTS_PAGE_SIZES = [25, 50, 100] as const;

/** Days after the initial send before follow-up 1 / 2 become due. */
export const FOLLOW_UP_1_AFTER_DAYS = 3;
export const FOLLOW_UP_2_AFTER_DAYS = 7;
