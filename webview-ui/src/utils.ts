import type { Node, Edge } from 'reactflow';
import type { FileNode } from './types';

export function convertToReactFlowElements(nodes: FileNode[]): { nodes: Node[], edges: Edge[] } {
  const flowNodes: Node[] = [];
  const flowEdges: Edge[] = [];
  
  function processNode(node: FileNode, parentId?: string, level = 0) {
    const position = calculatePosition(level, flowNodes.filter(n => n.data.level === level).length);
    
    const flowNode: Node = {
      id: node.id,
      type: 'default',
      position,
      data: {
        label: node.name,
        path: node.path,
        type: node.type,
        level
      },
      style: {
        background: node.type === 'directory' ? '#e1f5fe' : '#f3e5f5',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '12px',
        width: 'auto',
        minWidth: '120px'
      }
    };
    
    flowNodes.push(flowNode);
    
    if (parentId) {
      flowEdges.push({
        id: `edge-${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: 'smoothstep',
        style: { stroke: '#999' }
      });
    }
    
    if (node.children) {
      node.children.forEach(child => processNode(child, node.id, level + 1));
    }
  }
  
  nodes.forEach(node => processNode(node));
  
  return { nodes: flowNodes, edges: flowEdges };
}

function calculatePosition(level: number, index: number): { x: number, y: number } {
  const levelSpacing = 250;
  const nodeSpacing = 100;
  
  return {
    x: level * levelSpacing,
    y: index * nodeSpacing
  };
}
