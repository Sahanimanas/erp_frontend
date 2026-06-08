import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store";
import AppRoutes from "./routes/AppRoutes";

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { fontSize: "13px", borderRadius: "10px" },
            success: { iconTheme: { primary: "#6366f1", secondary: "#fff" } },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}
