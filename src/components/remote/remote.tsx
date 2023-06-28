import { component$, SSRStream } from "@builder.io/qwik";

export const RemoteApp = component$(({ name }: { name: string }) => {
  const path = `https://qwik-multi-worker-${name}.devdash.workers.dev`;

  return (
    <>
      <div>
        From: <a href={path}>{path}</a>
      </div>
      <SSRStream>
        {async (stream) => {
          const res = (await fetch(path)) as any;
          const reader = res.body.getReader();
          const decoder = new TextDecoder("utf-8");

          const replaceString = 'q:base="/build/"';
          const replacementString = `q:base="/container/build/${name}/"`;

          while (true) {
            const { done, value } = await reader.read();

            if (done) {
              break;
            }

            const chunk = decoder.decode(value);
            const modifiedChunk = chunk.replace(
              replaceString,
              replacementString
            ).replace('workers-logo.svg','https://qwik-multi-worker-header.devdash.workers.dev/workers-logo.svg')



            stream.write(modifiedChunk);
          }

          stream.write('');

          return new Promise((resolve) => {
            reader.releaseLock();
            resolve();
          });
        }}
      </SSRStream>
    </>
  );
});
