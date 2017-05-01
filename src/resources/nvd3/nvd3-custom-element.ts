import { autoinject, noView, LogManager, bindable, bindingMode, BindingEngine } from "aurelia-framework";
import * as moment from "moment";
import * as d3 from 'd3';
import * as nvd3 from 'nvd3';
declare var nv: any;

//import nvd3css from 'nvd3/nv.d3.min.css!';

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

        nvd3.addGraph(() => {
            this.chart = nvd3.models.pieChart();
            // chart.title('stuff')
            // .titleOffset(-10);

            this.chart.options(this.options);

            this.chart.x(function (d) {
                if (d.app === 'Default') {
                    return d.title
                }
                return (d.app) ? d.app : 'undefined';
            })
            this.chart.y(function (d) {
                return d.timeDiffInMs;
            })
            this.chart.color(function (d) {
                return d.color;
            })
            this.chart.valueFormat((d) => {
                return this.msToDuration.toView(d);
            })

            nvd3.utils.windowResize(this.chart.update);
            this.isInitializedResolve()
            return this.chart;
        });
    }

    dataListChanged(oldList, newList) {
        logger.debug("DataList changed", oldList, newList);
        this.listChanged(this.dataList)
    }

    listChanged(data) {
        logger.debug('Data changed', data);
        this.isInitialized.then(() => {
            // remove whole svg element with old data
            d3.select(this.element).select('svg').remove();
            //d3.selectAll('svg > *').remove();
            d3.select(this.element).insert('svg', '.caption')
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
