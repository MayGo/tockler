import { autoinject, noView, LogManager, bindable, bindingMode } from "aurelia-framework";
import * as moment from "moment";
import * as d3 from 'd3';
import * as nvd3 from 'nvd3';
declare var nv: any;

//import 'novus/nvd3/build/nv.d3.css!';
import { EventAggregator } from 'aurelia-event-aggregator';


let logger = LogManager.getLogger('Nvd3CustomElement');

@noView()
@autoinject
export class Nvd3CustomElement {

    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    options: any;

    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    data: any;


    constructor(private element: Element) {

    }

    attached() {
        nvd3.addGraph(() => {
            var chart = nvd3.models.lineChart()
                .useInteractiveGuideline(true)
                ;

            chart.xAxis
                .axisLabel('Time (ms)')
                .tickFormat(d3.format(',r'))
                ;

            chart.yAxis
                .axisLabel('Voltage (v)')
                .tickFormat(d3.format('.02f'))
                ;

            d3.select('#chart svg')
                .datum(this.dataGen())
                .transition().duration(500)
                .call(chart)
                ;

            nvd3.utils.windowResize(chart.update);

            return chart;
        });
    }
    dataGen() {
        var sin = [],
            cos = [];

        for (var i = 0; i < 100; i++) {
            sin.push({ x: i, y: Math.sin(i / 10) });
            cos.push({ x: i, y: .5 * Math.cos(i / 10) });
        }

        return [
            {
                values: sin,
                key: 'Sine Wave',
                color: '#ff7f0e'
            },
            {
                values: cos,
                key: 'Cosine Wave',
                color: '#2ca02c'
            }
        ];
    }

    detached() {

    }

}
