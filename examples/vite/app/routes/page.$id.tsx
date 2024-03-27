import { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export function loader({ params }: LoaderFunctionArgs) {
  if (!params.id) throw Error("No id provided");
  return { id: params.id };
}

export default function Component() {
  let data = useLoaderData<typeof loader>();
  return <h1>Hello from Page {data.id}</h1>;
}
