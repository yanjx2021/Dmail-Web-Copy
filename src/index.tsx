import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./pages/App";
import { configure } from "mobx";
import localforage from "localforage";

configure({
    enforceActions: "observed",
    computedRequiresReaction: true,
    reactionRequiresObservable: true,
    observableRequiresReaction: true,
    disableErrorBoundaries: true
});


localforage.config({
    name: "dMail",
})

const root = ReactDOM.createRoot(
    document.getElementById("root") as HTMLElement
);

root.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>
);
