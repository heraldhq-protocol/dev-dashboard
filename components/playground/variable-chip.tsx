import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';

export const VariableChipNode = Node.create({
  name: 'mention',

  group: 'inline',

  inline: true,

  selectable: false,

  atom: true,

  addAttributes() {
    return {
      id: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute('data-id'),
        renderHTML: (attributes: Record<string, any>) => {
          if (!attributes.id) {
            return {};
          }

          return {
            'data-id': attributes.id,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-mention]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }: { node: any; HTMLAttributes: Record<string, any> }) {
    return [
      'span',
      mergeAttributes({ 'data-mention': '' }, HTMLAttributes, { class: 'mention' }),
      `{{${node.attrs.id}}}`,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableChipComponent);
  },
});

function VariableChipComponent(props: any) {
  return (
    <NodeViewWrapper as="span" className="inline-block mx-0.5 align-middle">
      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 cursor-default select-none shadow-sm">
        {props.node.attrs.id}
      </span>
    </NodeViewWrapper>
  );
}
