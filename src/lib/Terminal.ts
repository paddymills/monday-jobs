
import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCircleNotch, faCheck, faComment, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
    
enum ItemState {
    Default,
    Pending,
    Complete,
    Error,
};

// type SubItems = Record<number, TerminalItem>;
type IconParams = { class: string, icon: IconDefinition, spin: boolean };

abstract class TerminalItem {
    getText(): string { return ""; }
    getState(): ItemState { return ItemState.Default; }
    hasSubItems(): boolean { return false; }
    subItems(): Array<TerminalItem> { return new Array();  }

    iconParams(): IconParams {
        switch (this.getState()) {
            case ItemState.Default:
                return { class: "message", icon: faComment, spin: false};
            case ItemState.Pending:
                return { class: "pending", icon: faCircleNotch, spin: true};
            case ItemState.Complete:
                return { class: "complete", icon: faCheck, spin: false};
            case ItemState.Error:
                return { class: "error", icon: faExclamationTriangle, spin: false};
        }
    }
}

class TerminalMessage extends TerminalItem {
    text: string;

    constructor(text: string) {
        super(); // does nothing
        this.text = text;
    }

    getText(): string {
        return this.text;
    }
}

class AsyncTerminalMessage<T> extends TerminalMessage {
    state: ItemState;

    constructor(text: string, promise: Promise<T>, onComplete?: (res: T) => {}) {
        super(text);

        this.state = ItemState.Pending;
        promise
            .then((res) => {
                this.state = ItemState.Complete;

                if ( onComplete !== undefined ) {
                    onComplete(res);
                }
            },
            (err) => {
                this.state = ItemState.Error;
                console.log(err);
            });
    }

    getState(): ItemState {
        return this.state;
    }
}

class AsyncTerminalMessageGroup<T> extends TerminalMessage {
    state: ItemState;
    subMessages: Array<AsyncTerminalMessage<T>>;
    newAtTop: boolean;

    constructor(text: string, newAtTop?: boolean) {
        super(text);

        this.state = ItemState.Pending;
        this.subMessages = new Array();
        this.newAtTop = newAtTop || false;
    }

    addMessage(message: AsyncTerminalMessage<T>) {
        this.subMessages.push(message);
    }

    async finalize(): Promise<void> {
        Promise
            .allSettled(this.subMessages)
            .then(() => {
                this.state = ItemState.Complete;
            });
    }
}

export { ItemState, type TerminalItem, TerminalMessage, AsyncTerminalMessage, AsyncTerminalMessageGroup };
