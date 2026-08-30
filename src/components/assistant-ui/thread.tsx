"use client";

import { cn } from "@/lib/utils";
import {
  ActionBarPrimitive,
  AuiIf,
  ComposerPrimitive,
  MessagePrimitive,
  ThreadPrimitive,
  type ToolCallMessagePartProps,
} from "@assistant-ui/react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  CheckIcon,
  CopyIcon,
  RefreshCwIcon,
  SquareIcon,
  WrenchIcon,
} from "lucide-react";
import type { FC } from "react";

export const Thread: FC<{ className?: string }> = ({ className }) => {
  return (
    <ThreadPrimitive.Root
      className={cn(
        "flex h-full flex-col bg-background @container",
        className,
      )}
      style={{
        ["--thread-max-width" as string]: "44rem",
      }}
    >
      <ThreadPrimitive.Viewport className="flex flex-1 flex-col overflow-y-auto scroll-smooth">
        <AuiIf condition={(s) => s.thread.isEmpty}>
          <ThreadWelcome />
        </AuiIf>

        <AuiIf condition={(s) => !s.thread.isEmpty}>
          <div className="mx-auto w-full max-w-[var(--thread-max-width)] flex-1 px-4 pt-6">
            <ThreadPrimitive.Messages>
              {({ message }) => {
                if (message.role === "user") return <UserMessage />;
                return <AssistantMessage />;
              }}
            </ThreadPrimitive.Messages>
          </div>
        </AuiIf>

        <ThreadPrimitive.ViewportFooter className="sticky bottom-0 mt-auto bg-background pb-4 md:pb-6">
          <ThreadScrollToBottom />
          <div className="mx-auto w-full max-w-[var(--thread-max-width)] px-4">
            <Composer />
          </div>
        </ThreadPrimitive.ViewportFooter>
      </ThreadPrimitive.Viewport>
    </ThreadPrimitive.Root>
  );
};

const ThreadWelcome: FC = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
    <p className="text-2xl font-semibold text-foreground">
      How can I help you today?
    </p>
    <p className="text-muted-foreground text-sm">
      Send a message to get started.
    </p>
  </div>
);

const ThreadScrollToBottom: FC = () => (
  <div className="flex justify-center">
    <ThreadPrimitive.ScrollToBottom className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm transition-colors hover:bg-accent data-[visible=false]:pointer-events-none data-[visible=false]:opacity-0">
      <ArrowDownIcon className="h-4 w-4" />
    </ThreadPrimitive.ScrollToBottom>
  </div>
);

const Composer: FC = () => (
  <ComposerPrimitive.Root className="relative flex w-full flex-col rounded-2xl border border-border bg-card">
    <ComposerPrimitive.Input
      placeholder="Send a message..."
      className="min-h-12 w-full resize-none bg-transparent px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/60 outline-none"
      rows={1}
      autoFocus
      enterKeyHint="send"
      aria-label="Message input"
    />
    <div className="flex items-center justify-end px-3 pb-2">
      <AuiIf condition={(s) => !s.thread.isRunning}>
        <ComposerPrimitive.Send className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground transition-opacity disabled:opacity-30">
          <ArrowUpIcon className="h-4 w-4" />
        </ComposerPrimitive.Send>
      </AuiIf>
      <AuiIf condition={(s) => s.thread.isRunning}>
        <ComposerPrimitive.Cancel className="flex h-8 w-8 items-center justify-center rounded-full bg-destructive text-destructive-foreground">
          <SquareIcon className="h-3 w-3" />
        </ComposerPrimitive.Cancel>
      </AuiIf>
    </div>
  </ComposerPrimitive.Root>
);

const UserMessage: FC = () => (
  <MessagePrimitive.Root
    data-role="user"
    className="flex flex-col items-end gap-1 py-3"
  >
    <div className="max-w-[85%] rounded-2xl bg-primary/10 px-4 py-2.5 text-foreground">
      <MessagePrimitive.Content />
    </div>
  </MessagePrimitive.Root>
);

const ToolCallFallback: FC<ToolCallMessagePartProps> = ({ toolName, args }) => (
  <div className="my-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
      <WrenchIcon className="h-3.5 w-3.5" />
      <span>{toolName}</span>
    </div>
    {args && (
      <pre className="mt-1 text-xs text-muted-foreground/80 overflow-x-auto">
        {typeof args === "string" ? args : JSON.stringify(args, null, 2)}
      </pre>
    )}
  </div>
);

const AssistantMessage: FC = () => (
  <MessagePrimitive.Root
    data-role="assistant"
    className="flex flex-col items-start gap-1 py-3"
  >
    <div className="max-w-[85%] space-y-2">
      <MessagePrimitive.Content
        components={{
          tools: { Fallback: ToolCallFallback },
        }}
      />
    </div>
    <AssistantActionBar />
  </MessagePrimitive.Root>
);

const AssistantActionBar: FC = () => (
  <ActionBarPrimitive.Root
    hideWhenRunning
    autohide="not-last"
    className="flex gap-1 text-muted-foreground"
  >
    <ActionBarPrimitive.Copy className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground">
      <AuiIf condition={(s) => s.message.isCopied}>
        <CheckIcon className="h-3.5 w-3.5" />
      </AuiIf>
      <AuiIf condition={(s) => !s.message.isCopied}>
        <CopyIcon className="h-3.5 w-3.5" />
      </AuiIf>
    </ActionBarPrimitive.Copy>
    <ActionBarPrimitive.Reload className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-accent hover:text-accent-foreground">
      <RefreshCwIcon className="h-3.5 w-3.5" />
    </ActionBarPrimitive.Reload>
  </ActionBarPrimitive.Root>
);
