import { autoinject, noView, LogManager, bindable, bindingMode, BindingEngine } from "aurelia-framework";
import * as moment from "moment";
import * as d3 from 'd3';
import * as britecharts from 'britecharts';

import { EventAggregator } from 'aurelia-event-aggregator';
import { MsToDurationValueConverter } from "../../resources/converters/ms-to-duration-value-converter";


let logger = LogManager.getLogger('Nvd3CustomElement');

@noView()
@autoinject
export class Nvd3CustomElement {

    private msToDuration = new MsToDurationValueConverter()

    options: any = {
        height: 300,
        width: 300,

        showLabels: false,
        duration: 500,
        labelThreshold: 0.01,
        labelSunbeamLayout: true,
        showLegend: false,
        donut: true,
        donutRatio: 0.30
    };

    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    dataList: any = [];

    subscriptions: any = [];

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
        logger.debug("Attached:", this.dataList)
        let subscription = this.bindingEngine.collectionObserver(this.dataList).subscribe(this.listChanged);
        this.subscriptions.push(subscription);

        this.chart = britecharts.donut();
        let donutContainer = d3.select('.pie-chart');
console.error(this.chart)
        let containerWidth = 100;//donutContainer.node() ? donutContainer.node().getBoundingClientRect().width : false;

        this.chart
            .isAnimated(true)
            .highlightSliceById(2)
            .width(containerWidth)
            .height(containerWidth)
            .externalRadius(containerWidth / 2.5)
            .internalRadius(containerWidth / 5)
            .on('customMouseOver', function (data) {
                //legendChart.highlight(data.data.id);
            })
            .on('customMouseOut', function () {
                //legendChart.clearHighlight();
            });

        // donutContainer.datum(dataset).call(donutChart);
    }

    dataListChanged(oldList, newList) {
        logger.debug("DataList changed", oldList, newList);
        /*
                quantity	Number	Quantity of the group (required)
        percentage	Number	Percentage of the total (optional)
        name	String	Name of the group (required)
        id*/
        let donutData = this.dataList.map((item) => { return { quantity: item.timeDiffInMs, name: item.app } });
        logger.debug("Donut data:", donutData);
        this.listChanged(donutData)
    }

    listChanged(data) {
        logger.debug('Data changed', data);
        this.isInitialized.then(() => {
            // remove whole svg element with old data
            d3.select(this.element).select('svg').remove();
            //d3.selectAll('svg > *').remove();
            d3.select(this.element).insert('svg', '.pie-chart')
                .datum(this.dataList)
                .transition().duration(500)
                .call(this.chart);
        })
    }

    detached() {
        this.disposeSubscriptions();
    }

    disposeSubscriptions() {
        while (this.subscriptions.length) {
            logger.debug("Dispose subscriptions");
            this.subscriptions.pop().dispose();
        }
    }

}
