import { LuRectangleHorizontal } from "react-icons/lu";
import { VscGraphLine } from "react-icons/vsc";
import { TfiBarChartAlt } from "react-icons/tfi";
import { GrPieChart } from "react-icons/gr";
import { GiHistogram } from "react-icons/gi";
import { AiOutlineAreaChart } from "react-icons/ai";
import { MdOutlineDonutSmall } from "react-icons/md";
import { AiOutlineFunnelPlot } from "react-icons/ai";
import { FaRegRectangleList } from "react-icons/fa6";
import { PiGaugeLight } from "react-icons/pi";
import AddBarChart from "@/components/design/add-widget/AddBarChart";
import AddPieChart from "@/components/design/add-widget/AddPieChart";
import AddHistogram from "@/components/design/add-widget/AddHistogram";
import AddAreaChart from "@/components/design/add-widget/AddAreaChart";
import AddDonutChart from "@/components/design/add-widget/AddDonutChart";
import { PiChartScatter } from "react-icons/pi";
import { TbChartTreemap } from "react-icons/tb";
import { TbChartBubble } from "react-icons/tb";
import { MdOutlineWaterfallChart } from "react-icons/md";
import AddFunnelChart from "@/components/design/add-widget/AddFunnelChart";
import AddScatterChart from "@/components/design/add-widget/AddScatterChart";
import AddGaugeChart from "@/components/design/add-widget/AddGaugeChart";
import AddTreemap from "@/components/design/add-widget/AddTreemap";
import AddBubbleChart from "@/components/design/add-widget/AddBubbleChart";
import AddWaterfallChart from "@/components/design/add-widget/AddWaterfallChart";
import AddLineChart from "@/components/design/add-widget/AddLineChart";
import AddHeader from "@/components/design/add-widget/AddHeader";
import AddKpiChart from "@/components/design/add-widget/AddKpiChart";

export const ElementsList = [
    {
        name: "Header",
        desc: "Header for your project",
        component: AddHeader,
        icon: <LuRectangleHorizontal />
    },
    {
        name: "Bar Chart",
        desc: "Bar Chart for your project",
        component: AddBarChart,
        icon: <TfiBarChartAlt />
    },
    {
        name: "Pie Chart",
        desc: "Pie Chart for your project",
        component: AddPieChart,
        icon: <GrPieChart />
    },
    {
        name: "Line Chart",
        desc: "Line Chart for your project",
        component: AddLineChart,
        icon: <VscGraphLine />
    },
    {
        name: "Area Chart",
        desc: "Area Chart for your project",
        component: AddAreaChart,
        icon: <AiOutlineAreaChart />
    },
    {
        name: "Donut Chart",
        desc: "Donut Chart for your project",
        component: AddDonutChart,
        icon: <MdOutlineDonutSmall />
    },
    {
        name: "Funnel Chart",
        desc: "Funnel Chart for your project",
        component: AddFunnelChart,
        icon: <AiOutlineFunnelPlot />
    },
    {
        name: "Scatter Plot",
        desc: "Scatter Plot for your project",
        component: AddScatterChart,
        icon: <PiChartScatter />
    },
    {
        name: "KPIs",
        desc: "Key Performance Indicators for your project",
        component: AddKpiChart,
        icon: <FaRegRectangleList />
    },
    {
        name: "Gauge",
        desc: "Gauge for your project",
        component: AddGaugeChart,
        icon: <PiGaugeLight />
    },
    {
        name: "Treemap ",
        desc: "Tree Map for your project",
        component: AddTreemap,
        icon: <TbChartTreemap />
    },
    {
        name: "Bubble Chart",
        desc: "Bubble Chart for your project",
        component: AddBubbleChart,
        icon: <TbChartBubble />
    },
    {
        name: "Waterfall Chart",
        desc: "Waterfall Chart for your project",
        component: AddWaterfallChart,
        icon: <MdOutlineWaterfallChart />
    },
    {
        name: "Histogram",
        desc: "Histogram for your project",
        component: AddHistogram,
        icon: <GiHistogram />
    },

];
