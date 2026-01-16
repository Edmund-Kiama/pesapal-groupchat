export enum SidebarState {
  collapsed = "collapsed",
  expanded = "expanded",
}

export type SidebarContextOptions = {
  state: SidebarState;
  onStateChanged: (state: SidebarState) => void;
};
