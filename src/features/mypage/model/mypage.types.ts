export type MypageShowingType =
  | 'main'
  | 'updateInfo'
  | 'updatePassword'
  | 'help';

export interface ScreenRouter {
  show: (type: MypageShowingType) => void;
  backToMain: () => void;
}

export interface MypageScreenDef {
  blockBack?: boolean;
  render: (ctx: ScreenRouter) => React.ReactNode;
}
