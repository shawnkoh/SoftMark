import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import "typeface-roboto";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { StylesProvider } from "@material-ui/styles";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUser } from "./auth/selectors";
import configureStore from "./store";

const store = configureStore();
toast.configure();
const loadUnauthenticatedApp = () => import("./UnauthenticatedApp");
const AuthenticatedApp = React.lazy(() => import("./AuthenticatedApp"));
const UnauthenticatedApp = React.lazy(() => import("./UnauthenticatedApp"));

const ActiveApp: React.FC = () => {
  const user = useSelector(getUser);

  useEffect(() => {
    loadUnauthenticatedApp();
  });

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
