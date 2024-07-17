import { Action, ActionPanel, List } from "@raycast/api";
import { useFetch, useLocalStorage } from "@raycast/utils";
import { JSDOM } from "jsdom";

export default function Command() {
  // 具体要渲染的数据，缓存
  const {
    value: dataItems,
    setValue: setDataItems,
    isLoading: valueLoading,
  } = useLocalStorage<Array<{ title: string; subtitle: string; url: string; cover?: string }>>("components", []);

  const { isLoading } = useFetch("https://ant-design.antgroup.com/components/overview-cn", {
    keepPreviousData: true,
    execute: (dataItems || []).length === 0,
    onData: async (source: string) => {
      // 处理html字符串
      const regex = /<section class="markdown">([\s\S]*?)<\/section>/g;
      const htmlStr = source.match(regex)?.[0];

      // 解析 HTML 字符串
      const dom = new JSDOM(htmlStr);
      const document = dom.window.document;

      const nodes = document.querySelectorAll('section.markdown a[href^="/components"]');
      const newNodes = [...nodes].map((node) => ({
        title: node.textContent?.split(" ")[0] || "",
        subtitle: node.textContent?.split(" ")[1] || "",
        url: `https://ant-design.antgroup.com${(node as HTMLAnchorElement)?.href || "/components/overview-cn"}`,
        cover: node.querySelector("img")?.src,
      }));

      setDataItems(newNodes);
    },
  });

  return (
    <List isShowingDetail isLoading={isLoading || valueLoading}>
      {(dataItems || []).map((item) => (
        <List.Item
          key={item.title}
          title={item.title}
          subtitle={item.subtitle}
          detail={item.cover && <List.Item.Detail markdown={`![Illustration](${item.cover})`} />}
          actions={
            <ActionPanel>
              <Action.OpenInBrowser url={item.url} />
            </ActionPanel>
          }
        />
      ))}
    </List>
  );
}
