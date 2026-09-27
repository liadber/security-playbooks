/** Navigation state passed along when a visitor is sent to /login. */
export interface RedirectState {
  /** The in-app path the visitor asked for. */
  from?: string;
}
