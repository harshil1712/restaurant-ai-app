import type { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  const AI = getRequestContext().env.AI;

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    const blob = await file.arrayBuffer();
    const input = {
      // @ts-ignore
      image: [...new Uint8Array(blob)],
      prompt: `Help me with translating the image of a restaurant menu into English. Please provide the list of the ingredients. Tell me if the dish is vegeterian or not. If you don't know the answer to any of these questions, you can say 'I don't know'. Provide the result in markdown format.
        `,
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
