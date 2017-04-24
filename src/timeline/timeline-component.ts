import { autoinject, noView, LogManager, bindable, bindingMode } from "aurelia-framework";
import * as moment from "moment";
import * as d3 from 'd3';
import * as d3Tip from "d3-tip"; // d3-tip@0.7.0 (with a d3@^4 dependency)
import { EventAggregator } from 'aurelia-event-aggregator';


let logger = LogManager.getLogger('TimelineComponent');

@noView()
@autoinject
export class TimelineComponent {
    subscriptions = [];

    @bindable({
        defaultBindingMode: bindingMode.twoWay
    })
    selectedTrackItem: any;
    // constants
    margin = {
        top: 20,
        right: 30,
        bottom: 15,
        left: 10
    };

    h = 140;
    w = window.innerWidth;

    height = this.h - this.margin.top - this.margin.bottom - 5;
    width = this.w - this.margin.right - this.margin.left - 5;

    lanes = ["LogTrackItem", "StatusTrackItem", "AppTrackItem"];

    mainHeight = 70;
    miniHeight = 30;


    logTrackItemHeight = (this.mainHeight + this.miniHeight - (this.margin.top + this.margin.bottom)) / 3;

    constructor(private element: Element, private eventAggregator: EventAggregator) {

        console.log(this.miniHeight, this.mainHeight);

        console.log(this.height, this.width);
        this.init(element);
    }

    attached() {
        let subscriptionAdd = this.eventAggregator.subscribe('addItemsToTimeline', trackItems => {
            logger.debug('addItemsToTimeline', trackItems);
            this.addItemsToTimeline(trackItems);
        });

        let subscriptionRemove = this.eventAggregator.subscribe('removeItemsFromTimeline', trackItems => {
            logger.debug('removeItemsFromTimeline', trackItems);
            this.removeItemsFromTimeline(trackItems);
        });

        this.subscriptions.push(subscriptionAdd);
        this.subscriptions.push(subscriptionRemove);
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


    timeDomainStart: any = moment().startOf('day').toDate();
    timeDomainEnd: any = d3.time.day.offset(this.timeDomainStart, 1);

    //scales

    xScaleMain: any = d3.time.scale()
        .domain([this.timeDomainStart, this.timeDomainEnd])
        .range([0, this.width])
        .clamp(true);

    yScaleMain: any = d3.scale.ordinal()
        .domain(this.lanes)
        .rangeRoundBands([0, this.mainHeight], .1);

    xScaleMini: any = d3.time.scale()
        .domain([this.timeDomainStart, this.timeDomainEnd])
        .range([0, this.width])
        .clamp(true);

    yScaleMini: any = d3.scale.ordinal()
        .domain(this.lanes)
        .rangeRoundBands([0, this.miniHeight], .1);

    chart;
    main;
    mini;
    miniBrush;

    selectionTool;

    allItems = [];
    xAxisMain;
    tip;

    init(el) {
        console.log("Element:", el);
        console.log("Element cahrt:", d3.select(el));

        this.chart = d3.select(el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .attr("class", "chart");

        console.log("Element cahrt:", this.chart);
        this.chart.append("defs").append("clipPath")
            .attr("id", "clip")
            .append("rect")
            .attr("width", this.width)
            .attr("height", this.mainHeight);

        this.main = this.chart.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("width", this.width)
            .attr("height", this.mainHeight)
            .attr("class", "main");

        this.mini = this.chart.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + (this.mainHeight + this.margin.top) + ")")
            .attr("width", this.width)
            .attr("height", this.miniHeight)
            .attr("class", "mini");

        // MAIN AXIS

        var tickFormat = "%H:%M";

        this.xAxisMain = d3.svg.axis()
            .scale(this.xScaleMain)
            .orient("top")
            .tickFormat(d3.time.format(tickFormat))
            .ticks(20)
            .tickSize(this.mainHeight)
            .tickPadding(4);

        var yAxisMain = d3.svg.axis()
            .scale(this.yScaleMain)
            .orient("left")
            .tickSize(-2)
            .tickPadding(-90);

        this.main.append("g").attr("class", "x axis")
            .attr("transform", "translate(0, " + (this.mainHeight) + ")")
            .transition()
            .call(this.xAxisMain);

        // BRUSH
        // item selection/creation brush
        console.log("Init selection tool.");
        let self = this;
        this.selectionTool = d3.svg.brush().x(this.xScaleMain)
            .on("brushstart", function () { self.selectionToolBrushStart(this) })
            .on("brushend", function () { self.selectionToolBrushEnd() })
            .on("brush", function () { self.selectionToolBrushing() });

        console.error(this.logTrackItemHeight)

        this.main.append('g')
            .attr('class', 'brush').call(this.selectionTool);
        d3.select(".brush").selectAll(".extent")
            .attr('height', this.logTrackItemHeight);
        d3.select(".brush").selectAll(".background")
            .attr('height', this.mainHeight);

        // Add handles
        var arc = d3.svg.arc()
            .outerRadius(this.logTrackItemHeight)
            .startAngle(0)
            .endAngle(function (d, i) {
                return i ? -Math.PI : Math.PI;
            });
        d3.select(".brush").selectAll(".resize").append("path")
            .attr("transform", "translate(0," + this.logTrackItemHeight / 2 + ")")
            .attr("d", arc);

        // hide rect for Status/AppTrackItem
        d3.select(".brush").selectAll(".resize rect").style('display', 'none');

        //add Time texts on handles
        d3.select(".brush").selectAll(".resize").append("text")
            .text("").style("text-anchor", "middle");


        // track items clip
        // y axis labels is on top of items
        this.main.append("g")
            .attr("id", "mainItemsId")
            .attr("clip-path", "url(#clip)");

        this.main.append("g").attr("class", "y axis")
            .transition()
            .call(yAxisMain);


        // MINI AXIS
        // miniBrush is on top of items layer and  axis labels is on top of items
        this.mini.append("g")
            .attr("id", "miniItemsId");

        var xAxisMini = d3.svg.axis()
            .scale(this.xScaleMini)
            .orient("bottom")
            .tickFormat(d3.time.format(tickFormat))
            .ticks(d3.time.minute, 60)
            .tickSize(3)
            .tickPadding(4);

        this.mini.append("g").attr("class", "x axis")
            .attr("transform", "translate(0, " + this.miniHeight + ")")
            .transition()
            .call(xAxisMini);

        //miniBrush
        this.miniBrush = d3.svg.brush()
            .x(this.xScaleMini)
            .on("brush", () => this.displaySelectedInMain());

        this.mini.append("g")
            .attr("class", "x miniBrush")
            .call(this.miniBrush)
            .selectAll("rect")
            .attr("y", 1)
            .attr("height", this.miniHeight);

        // tooltips
        this.tip = this.initTooltips(this.chart);


    }

    changeDay(day) {

        // if 'day' is undefined, exit
        if (!day) {
            console.log("Not changeing, no day.")
            return;
        }
        console.log('Changing day: ' + day);
        //Remove everything
        this.chart.selectAll('.miniItems').remove();
        this.chart.selectAll('.mainItems').remove();

        this.allItems = [];
        this.updateDomain(day);
        this.drawMiniBrush(day);
    }

    drawMiniBrush(day) {

        var start = moment(day).startOf('day').toDate();
        var end = moment(day).startOf('day').add(1, 'day').toDate();

        // show about an hour if today else
        var isToday = moment(day).isSame(moment(), 'day');
        if (isToday) {
            start = moment().subtract(1, 'hours').toDate();
            end = moment().add(10, 'minutes').toDate();
        }

        console.log("Setting miniBrush to:", start, end);
        this.miniBrush.extent([start, end]);
    }

    updateDomain(day) {
        // Update time domain
        var timeDomainStart = day;
        //console.log("Update time domain: ", timeDomainStart)
        var timeDomainEnd = d3.time.day.offset(timeDomainStart, 1);
        this.xScaleMini.domain([timeDomainStart, timeDomainEnd]);
    }

    addItemsToTimeline(trackItems) {
        console.log('addItemsToTimeline', trackItems.length);
        this.allItems.push(...trackItems);

        //mini item rects
        var rects = this.mini.select("#miniItemsId").selectAll(".miniItems")
            .data(this.allItems);

        rects.enter()
            .append("rect")
            .attr("class", "miniItems")
            .attr("id", (d) => {
                return "mini_" + d.id;
            })
            .attr("height", 7);

        rects
            .style("fill", (d) => {
                return d.color;
            })
            .attr("x", (d) => {
                return this.xScaleMini(new Date(d.beginDate));
            })
            .attr("y", (d) => {
                return this.yScaleMini(d.taskName);
            })
            .attr("width", (d) => {
                if ((this.xScaleMini(new Date(d.endDate)) - this.xScaleMini(new Date(d.beginDate))) < 0) {
                    console.error("Negative value, error with dates.");
                    console.log(d);
                    return 0;
                }
                return (this.xScaleMini(new Date(d.endDate)) - this.xScaleMini(new Date(d.beginDate)));
            });

        this.displaySelectedInMain();
    }

    removeItemsFromTimeline(trackItems) {
        console.log('removeItemsFromTimeline');
        this.allItems = [];
        this.addItemsToTimeline(trackItems);
    }

    displaySelectedInMain() {

        var minExtent = this.miniBrush.extent()[0],
            maxExtent = this.miniBrush.extent()[1],
            visItems = this.allItems.filter((d) => {
                return new Date(d.beginDate) <= maxExtent && new Date(d.endDate) >= minExtent;
            });

        console.log("Displaying minExtent <> maxExtent", minExtent, maxExtent);

        this.mini.select(".miniBrush")
            .call(this.miniBrush.extent([minExtent, maxExtent]));

        console.log("Updating main view scale and axis");
        this.xScaleMain.domain([minExtent, maxExtent]);
        //xAxisMain.scale(xScaleMain);
        this.main.select(".x.axis").call(this.xAxisMain);

        var rects = this.main.select("#mainItemsId").selectAll(".mainItems")
            .data(visItems);

        // insert
        rects.enter().append("rect")
            .attr("class", "mainItems")
            .attr("id", (d) => {
                return "main_" + d.id;
            })
            .attr("height", (d) => {
                return 20;
            })
            ;

        //update
        rects.style("fill", (d) => {
            return d.color;
        })
            .attr("x", (d) => {
                return this.xScaleMain(new Date(d.beginDate));
            })
            .attr("y", (d) => {
                return this.yScaleMain(d.taskName);
            })
            .attr("width", (d) => {
                return this.xScaleMain(new Date(d.endDate)) - this.xScaleMain(new Date(d.beginDate));
            });

        rects.exit().remove();
        let self = this;
        rects.on('click', function (d, i) { self.onClickTrackItem(d, i, this) })
            .on('mouseover', function (d, i, e) { self.tip.show(d, i, e) })
            .on('mouseout', function (d, i, e) { self.tip.hide(d, i, e) });

    }

    onClickTrackItem(d, i, element) {

        console.log("onClickTrackItem", d, i);
        //clearBrush();
        var p = d3.select(element);
        var data = p.data()[0];

        var selectionToolSvg = d3.select(".brush");
        var translate = p.attr('transform');
        var x = new Number(p.attr('x'));
        var y = new Number(p.attr('y'));

        // Create object from TrackItem object, to prevent updating trackitem
        this.selectedTrackItem = {
            id: data.id,
            app: data.app,
            taskName: data.taskName,
            beginDate: new Date(data.beginDate),
            endDate: new Date(data.endDate),
            title: data.title,
            color: data.color,
            originalColor: data.color,
            left: x + 'px',
            top: y + 'px'
        };

        //$scope.$apply();

        if (data.taskName === 'LogTrackItem') {
            selectionToolSvg.selectAll("path").style('display', 'inherit');
        } else {
            selectionToolSvg.selectAll("path").style('display', 'none');
        }

        // position brush same as trackitem
        selectionToolSvg.selectAll(".extent")
            .attr('height', p.attr('height'))
            .attr('y', p.attr('y'));

        // Make brush same size as trackitem
        this.selectionTool.extent([new Date(data.beginDate), new Date(data.endDate)]);
        selectionToolSvg.call(this.selectionTool);

        // prevent event bubbling up, to unselect when clicking outside
        event.stopPropagation();

        this.updateBrushTimeTexts();
    }

    updateBrushTimeTexts() {

        var beginDate = new Date(this.selectionTool.extent()[0].getTime());
        var endDate = new Date(this.selectionTool.extent()[1].getTime());

        console.log("Updating brush texts: ", beginDate, endDate);

        var format = d3.time.format("%H:%M:%S");
        d3.select(".brush .resize.w").select("text")
            .text(format(beginDate));
        d3.select(".brush .resize.e").select("text")
            .text(format(endDate));
    }

    initTooltips(addToSvg) {
        console.log("Init tooltip");

        var format = d3.time.format("%H:%M:%S");
        // set up initial svg object
        var d3tip = d3Tip().attr('class', 'd3-tip').html((d: any) => {
            var duration = moment.duration(+new Date(d.endDate) - +new Date(d.beginDate))
            var formattedDuration = moment.utc(duration.asMilliseconds()).format("HH[h] mm[m] ss[s]");
            // strip leading zeroes
            formattedDuration = formattedDuration.replace('00h 00m', '');
            formattedDuration = formattedDuration.replace('00h ', '');
            return "<strong>" + d.app + ":</strong> <span>" + d.title + "</span><div>" +
                format(new Date(d.beginDate)) + " - " + format(new Date(d.endDate)) + "</div>" +
                "<div><b>" + formattedDuration + "</b></div>";
        });

        addToSvg.call(d3tip);

        return d3tip;
    }

    clearBrush() {
        console.log("Clear brush");
        console.log(this.selectedTrackItem);
        // Hide selection brushes
        this.selectionTool.clear();
        d3.select(".brush").call(this.selectionTool);
        // d3.select(".brush").selectAll("rect").attr('height', logTrackItemHeight);
    }

    selectionToolBrushStart(element) {
        d3.select(".brush").selectAll("path")//.style('display', 'inherit');
        d3.select(".brush").selectAll("rect").attr("y", "0");
        var p = d3.select(element);

        var x = new Number(p.attr('x'));
        if (this.selectedTrackItem !== null && this.selectedTrackItem.taskName !== 'LogTrackItem') {
            this.selectedTrackItem = null;
            //$scope.$apply();
        }

    };

    selectionToolBrushing() {

        // Snap to minute
        var beginDate = d3.time.minute.round(this.selectionTool.extent()[0].getTime());
        var endDate = d3.time.minute.round(this.selectionTool.extent()[1].getTime());
        d3.select(".brush").call(this.selectionTool.extent([beginDate, endDate]));

        this.updateBrushTimeTexts();
    }

    selectionToolBrushEnd() {

        console.log("selectionToolBrushEnd:", this.selectionTool.extent());
        // change data based on selection brush
        var beginDate = this.selectionTool.extent()[0].getTime();
        var endDate = this.selectionTool.extent()[1].getTime();

        if (endDate - beginDate == 0) {
            console.log("Just a click");
            if (this.selectedTrackItem !== null) {
                this.selectedTrackItem = null;
                //$scope.$apply();
            }
            //return;
        }

        if (this.selectedTrackItem == null) {
            this.selectedTrackItem = { color: '#32CD32' };
        }

        this.selectedTrackItem.left = d3.select(".brush rect.extent").attr("x") + 'px';
        this.selectedTrackItem.beginDate = beginDate;
        this.selectedTrackItem.endDate = endDate;

        //$scope.$apply();
        // prevent event bubbling up, to unselect when clicking outside
        //event.stopPropagation();
        //event.stopPropagation();
    };

}
