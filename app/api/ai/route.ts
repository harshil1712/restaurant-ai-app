import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  let responseText = "Hello World";

  // In the edge runtime you can use Bindings that are available in your application
  // (for more details see:
  //    - https://developers.cloudflare.com/pages/framework-guides/deploy-a-nextjs-site/#use-bindings-in-your-nextjs-application
  //    - https://developers.cloudflare.com/pages/functions/bindings/
  // )
  //
  // KV Example:
  // const myKv = getRequestContext().env.MY_KV_NAMESPACE
  // await myKv.put('suffix', ' from a KV store!')
  // const suffix = await myKv.get('suffix')
  // responseText += suffix

  return new Response(responseText);
}

export async function POST(request: NextRequest) {
  const AI = getRequestContext().env.AI;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const blob = await file.arrayBuffer();
    const input = {
      // @ts-ignore
      image: [...new Uint8Array(blob)],
      prompt:
        "You are a helpul assistant. You help me with translating the image of a restaurant menu into English. You can provide a short description of the dish. Please provide the list of the ingredients. Tell me if the dish is vegeterian or not. You also have to provide me the nutrional benefits of the dish. If you don't know the answer to any of these questions, you can say 'I don't know'.",
    };

    // Initial prompt to agree to the usage of the model

    //   const initialResponse = await AI.run(
    //     "@cf/meta/llama-3.2-11b-vision-instruct",
    //     {
    //       prompt: "agree",
    //     }
    //   );

    const response = await AI.run(
      // @ts-ignore
      "@cf/meta/llama-3.2-11b-vision-instruct",
      input
    );
    return new Response(JSON.stringify(response), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify(e), { status: 500 });
  }
}
