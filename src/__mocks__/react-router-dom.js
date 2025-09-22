export const useNavigate = jest.fn();
export const useLocation = jest.fn(() => ({
  state: { from: { pathname: '/dashboard' } }
}));
export const BrowserRouter = ({ children }) => children;
export const Routes = ({ children }) => children;
export const Route = ({ children }) => children;