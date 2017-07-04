import { containerless, autoinject, noView, LogManager, bindable, bindingMode, BindingEngine } from "aurelia-framework";
import * as moment from "moment";
import * as d3 from 'd3';
import donutChart from 'britecharts/src/charts/donut.js';

import { EventAggregator } from 'aurelia-event-aggregator';
import { MsToDurationValueConverter } from "../../resources/converters/ms-to-duration-value-converter";


let logger = LogManager.getLogger('DonutChartCustomElement');


@autoinject
@noView
export class DonutChartCustomElement {

    private msToDuration = new MsToDurationValueConverter();

    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    dataList: any;

    private chart: any;
    private isInitialized: any;
    private isInitializedResolve: any;

    constructor(private element: Element, private bindingEngine: BindingEngine) {
        this.isInitialized = new Promise(
            (resolve, reject) => {
                this.isInitializedResolve = resolve;
            }
        );
    }

    attached() {
        logger.debug("Attached:", this.dataList);

        this.createChart();
    }


    createChart(donutColors = null) {
        this.chart = donutChart();
        let containerWidth = d3.select(this.element).node().getBoundingClientRect().width;

        this.chart
            // .isAnimated(true)
            //.highlightSliceById(2)
            .width(containerWidth)
            .height(containerWidth)
            .margin({
                top: 0,
                right: 0,
                bottom: 0,
                left: 0
            })
            .externalRadius(containerWidth / 2.5)
            .internalRadius(containerWidth / 5)
            .colorSchema(donutColors)
            .on('customMouseOver', function (data) {
                //legendChart.highlight(data.data.id);
            })
            .on('customMouseOut', function () {
                //legendChart.clearHighlight();
            });

    }
    removeChart() {
        d3.select(this.element).select('svg').remove();
    }

    dataListChanged(oldList, newList) {
        logger.debug("DataList changed", oldList, newList);
        /*
                quantity	Number	Quantity of the group (required)
        percentage	Number	Percentage of the total (optional)
        name	String	Name of the group (required)
        id*/
        let donutData = this.dataList.map((item) => {
            return { quantity: item.timeDiffInMs, name: item.app };
        });
        let donutColors = this.dataList.map((item) => {
            return item.color;
        });

        logger.debug("Donut colors:", donutColors);


        this.listChanged(donutData, donutColors);

    }

    listChanged(data, donutColors) {
        if (!this.chart) {
            logger.debug('Not refreshing chart.');
            return;
        }

        logger.debug('Data changed refreshing chart.', data);



        this.removeChart();
        this.createChart(donutColors);

        d3.select(this.element).datum(data)
            .call(this.chart);

    }
}
