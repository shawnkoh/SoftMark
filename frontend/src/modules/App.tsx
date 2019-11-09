import { StylesProvider } from "@material-ui/styles";
import React from "react";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "typeface-roboto";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUser } from "../store/auth/selectors";
import configureStore from "../store";
const AuthenticatedApp = React.lazy(() => import("./AuthenticatedApp"));
const UnauthenticatedApp = React.lazy(() => import("./UnauthenticatedApp"));

const store = configureStore();
toast.configure();

const ActiveApp: React.FC = () => {
  const user = useSelector(getUser);

  return (
    <React.Suspense fallback={<LoadingSpinner />}>
      {user ? <AuthenticatedApp /> : <UnauthenticatedApp />}
    </React.Suspense>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <StylesProvider injectFirst>
        <BrowserRouter>
          <ActiveApp />
        </BrowserRouter>
      </StylesProvider>
    </Provider>
  );
};

export default App;
