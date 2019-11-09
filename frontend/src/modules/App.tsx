import { StylesProvider } from "@material-ui/styles";
import React, { useEffect } from "react";
import { Provider, useSelector } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "typeface-roboto";
import LoadingSpinner from "../components/LoadingSpinner";
import { getUser } from "./auth/selectors";
import AuthenticatedApp from "./AuthenticatedApp";
import configureStore from "./store";
import UnauthenticatedApp from "./UnauthenticatedApp";

const store = configureStore();
toast.configure();

const ActiveApp: React.FC = () => {
  const user = useSelector(getUser);

  return user ? <AuthenticatedApp /> : <UnauthenticatedApp />;
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
