export class Friend {
    _id: string;
    firstName: string;
    lastName: string;
    profileImage: string;
    isOnline: boolean;
    isTyping: boolean;
    typingTimer: any;
}

export class ToolbarItem {
    id: string;
    icon: string;
    innerIconText: string;
    title: string;
    content: Object;
    getNotificationsNumber: Function;
    isShowToolbarItemBadget: Function;
    onClick: Function;
}

export class topIcon {
    id: string;
    class: string;
    innerIconText: string;
    title: string;
    isSelected: boolean;
    onClick: Function;
}

export class canvasTopIcon {
    icon: string;
    title: string;
    onClick: Function;
}