import { NextRequest, NextResponse } from 'next/server';
import JSZip from 'jszip';

interface Widget {
  id: string;
  type: string;
  props: {
    labels?: string[];
    datasets?: Array<{
      name?: string;
      dataPoints?: number[];
      data?: Array<{ x?: number; y?: number; r?: number }>;
    }>;
    dataPoints?: number[];
    initialValue?: number;
    data?: Array<{ id: string; parent?: string; name: string; value?: number }>;
  };
}

interface TransformedWidgetData {
  widgetId: string;
  widgetType: string;
  data: Array<Record<string, any>>;
}

// Enhanced data transformation for different chart types
const generateDataForPBI = (chartData: Widget[]): TransformedWidgetData[] => {
  const transformedData: TransformedWidgetData[] = [];
  
  chartData.forEach((widget, index) => {
    const widgetData: TransformedWidgetData = {
      widgetId: widget.id || `widget_${index}`,
      widgetType: widget.type,
      data: []
    };

    switch (widget.type) {
      case 'bar':
      case 'line':
      case 'column':
        if (widget.props.labels && widget.props.datasets) {
          widget.props.datasets.forEach((dataset, dsIndex) => {
            widget.props.labels!.forEach((label, labelIndex) => {
              widgetData.data.push({
                Category: label,
                Series: dataset.name || `Series ${dsIndex + 1}`,
                Value: dataset.dataPoints?.[labelIndex] || 0
              });
            });
          });
        }
        break;

      case 'pie':
      case 'donut':
        if (widget.props.labels && widget.props.datasets?.[0]?.dataPoints) {
          widget.props.labels.forEach((label, index) => {
            widgetData.data.push({
              Category: label,
              Value: widget.props.datasets![0].dataPoints![index] || 0
            });
          });
        }
        break;

      case 'bubble':
        if (widget.props.datasets?.[0]?.data) {
          widget.props.datasets[0].data.forEach((point, index) => {
            widgetData.data.push({
              X_Value: point.x || 0,
              Y_Value: point.y || 0,
              Size: point.r || 1,
              Category: `Point ${index + 1}`
            });
          });
        }
        break;

      case 'waterfall':
        if (widget.props.labels && widget.props.dataPoints) {
          widgetData.data.push({
            Category: 'Initial',
            Value: widget.props.initialValue || 0,
            Type: 'Initial'
          });
          
          widget.props.labels.forEach((label, index) => {
            widgetData.data.push({
              Category: label,
              Value: widget.props.dataPoints![index] || 0,
              Type: 'Step'
            });
          });
          
          const total = (widget.props.initialValue || 0) + 
                       (widget.props.dataPoints || []).reduce((acc, val) => acc + val, 0);
          widgetData.data.push({
            Category: 'Total',
            Value: total,
            Type: 'Total'
          });
        }
        break;

      case 'treemap':
        if (widget.props.data) {
          widget.props.data.forEach(item => {
            widgetData.data.push({
              ID: item.id,
              Parent: item.parent || '',
              Name: item.name,
              Value: item.value || 0
            });
          });
        }
        break;

      default:
        if (widget.props.labels && widget.props.datasets) {
          widget.props.datasets.forEach((dataset, dsIndex) => {
            widget.props.labels!.forEach((label, labelIndex) => {
              widgetData.data.push({
                Category: label,
                Series: dataset.name || `Series ${dsIndex + 1}`,
                Value: dataset.dataPoints?.[labelIndex] || 0
              });
            });
          });
        }
        break;
    }
    
    if (widgetData.data.length > 0) {
      transformedData.push(widgetData);
    }
  });
  
  if (transformedData.length === 0) {
    return [{
      widgetId: 'fallback',
      widgetType: 'bar',
      data: [
        { Category: 'Jan', Series: 'Sales', Value: 100 },
        { Category: 'Feb', Series: 'Sales', Value: 120 },
        { Category: 'Mar', Series: 'Sales', Value: 90 },
        { Category: 'Apr', Series: 'Sales', Value: 150 }
      ]
    }];
  }
  
  return transformedData;
};

const generatePBITMetadata = () => {
  return {
    version: "4.0",
    dataRefresh: {
      notifyOption: 0
    }
  };
};

const generateDataModelSchema = (transformedData: TransformedWidgetData[]) => {
  const tables = transformedData.map(widget => ({
    name: `Table_${widget.widgetId}`,
    columns: [
      {
        name: "Category",
        dataType: "string",
        sourceColumn: "Category"
      },
      {
        name: "Value", 
        dataType: "double",
        sourceColumn: "Value"
      }
    ],
    partitions: [
      {
        name: `Partition_${widget.widgetId}`,
        dataView: "full",
        source: {
          type: "m",
          expression: `let Source = Json.Document(Text.FromBinary(Binary.FromText("${Buffer.from(JSON.stringify(widget.data)).toString('base64')}", BinaryEncoding.Base64))) in Source`
        }
      }
    ]
  }));

  return {
    name: "SemanticModel",
    compatibilityLevel: 1567,
    model: {
      culture: "en-US",
      tables: tables
    }
  };
};

const generateReportLayout = (transformedData: TransformedWidgetData[]) => {
  const visualContainers = transformedData.map((widget, index) => ({
    x: (index % 2) * 600,
    y: Math.floor(index / 2) * 400,
    width: 500,
    height: 350,
    config: JSON.stringify({
      name: `visual_${widget.widgetId}`,
      title: `${widget.widgetType.charAt(0).toUpperCase() + widget.widgetType.slice(1)} Chart`,
      visualType: widget.widgetType === 'bar' ? 'columnChart' : 'pieChart'
    })
  }));

  return {
    id: 0,
    resourcePackages: [],
    sections: [
      {
        name: "ReportSection",
        width: 1280,
        height: 720,
        visualContainers: visualContainers
      }
    ],
    version: "5.0"
  };
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { chartData } = body;
    
    if (!chartData || !Array.isArray(chartData)) {
      return NextResponse.json({ error: 'Invalid chart data provided' }, { status: 400 });
    }

    const transformedData = generateDataForPBI(chartData);
    const metadata = generatePBITMetadata();
    const dataModel = generateDataModelSchema(transformedData);
    const reportLayout = generateReportLayout(transformedData);

    const zip = new JSZip();
    
    zip.file('Metadata', JSON.stringify(metadata, null, 2));
    zip.file('DataModelSchema', JSON.stringify(dataModel, null, 2));
    zip.file('Report/Layout', JSON.stringify(reportLayout, null, 2));
    
    const connections = {
      RemoteArtifacts: [],
      LocalArtifacts: []
    };
    zip.file('Connections', JSON.stringify(connections, null, 2));

    const content = await zip.generateAsync({ 
      type: 'nodebuffer',
      compression: 'DEFLATE',
      compressionOptions: {
        level: 6
      }
    });

    return new Response(content, {
      status: 200,
      headers: {
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': 'attachment; filename="dashboard_template.pbit"',
        'Content-Length': content.length.toString()
      }
    });

  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ 
      error: 'Failed to generate Power BI template',
      details: error.message 
    }, { status: 500 });
  }
}
