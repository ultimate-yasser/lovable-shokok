import { createRoot } from "react-dom/client";
import { QueryClient } from "@tanstack/react-query";
import { RouterProvider, createRouter, createHashHistory } from "@tanstack/react-router";

import { routeTree } from "@/routeTree.gen";
import { initNativeShell } from "./native";
import "./fonts.css";
import "@/styles.css";


// Native builds run from a local WebView origin with no server-side routing,
// so we use an in-memory history instead of the browser URL.
const router = createRouter({
  routeTree,
  context: { queryClient: new QueryClient() },
  history: createHashHistory(),
  scrollRestoration: true,
  defaultPreloadStaleTime: 0,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

initNativeShell();

createRoot(document.getElementById("root")!).render(
  <RouterProvider router={router} />,
);
