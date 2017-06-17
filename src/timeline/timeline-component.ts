import { autoinject, noView, LogManager, bindable, bindingMode } from "aurelia-framework";
import * as moment from "moment";
import * as d3 from 'd3';
import * as d3Tip from "d3-tip";
import { EventAggregator } from 'aurelia-event-aggregator';

let logger = LogManager.getLogger('TimelineComponent');

@noView()
@autoinject
export class TimelineComponent {
    subscriptions = [];

    @bindable({ defaultBindingMode: bindingMode.twoWay })
    selectedTrackItem: any;

    @bindable({ defaultBindingMode: bindingMode.oneWay })
    startDate: any;
    // constants
    margin = {
        top: 20,
        right: 30,
        bottom: 20,
        left: 15
    };

    h = 145;
    w = window.innerWidth;

    height = this.h - this.margin.top - this.margin.bottom - 5;
    width = this.w - this.margin.right - this.margin.left - 5;

    lanes = ["LogTrackItem", "StatusTrackItem", "AppTrackItem"];

    mainHeight = 70;
    miniHeight = 30;

    logTrackItemHeight = (this.mainHeight + this.miniHeight - (this.margin.top + this.margin.bottom)) / 3;

    tickFormat = "%H:%M";

    timeDomainStart: any = moment().startOf('day').toDate();
    timeDomainEnd: any = d3.utcDay.offset(this.timeDomainStart, 1);

    //scales

    xScaleMain: any = d3.scaleTime()
        .domain([this.timeDomainStart, this.timeDomainEnd])
        .range([0, this.width])
        .clamp(true);

    yScaleMain: any = d3.scaleBand()
        .domain(this.lanes)
        .range([0, this.mainHeight]);

    xScaleMini: any = d3.scaleTime()
        .domain([this.timeDomainStart, this.timeDomainEnd])
        .range([0, this.width])
        .clamp(true);

    yScaleMini: any = d3.scaleBand()
        .domain(this.lanes)
        .range([0, this.miniHeight]);

    chart;
    main;
    mini;
    miniBrush;

    mainBrush;

    allItems = [];
    xAxisMain;
    tip;

    constructor(private element: Element, private eventAggregator: EventAggregator) {

        console.log("Main size:", this.height, this.width);
        console.log("Mini size:", this.mainHeight, this.width);
        console.log("logTrackItemHeight size:", this.logTrackItemHeight);

        this.init(element);
    }

    attached() {
        let subscriptionAdd = this.eventAggregator.subscribe('addItemsToTimeline', trackItems => {
            logger.debug('addItemsToTimeline', trackItems);
            this.addItemsToTimeline(trackItems);
        });

        let subscriptionRemove = this.eventAggregator.subscribe('cleanDataAndAddItemsToTimeline', trackItems => {
            logger.debug('cleanDataAndAddItemsToTimeline', trackItems);
            this.cleanDataAndAddItemsToTimeline(trackItems);
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

    startDateChanged(newValue, oldValue) {
        logger.debug("startDateChanged", oldValue, newValue);
        this.changeDay(newValue);
    }

    init(el) {
        logger.debug("Initializing charts");

        this.initMainChart(el);
        this.initMiniChart(el);

        this.initMainAxis();
        this.initMainBrush();
        this.initMainItemsLayerOnTopOfBrush();

        this.initMiniAxis();
        this.initMiniBrush();

        // tooltips
        this.tip = this.initTooltips(this.main);
        console.log("Initializing chart done.");

    }

    initMainChart(el) {
        let chartMain = d3.select(el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.mainHeight + this.margin.top);

        chartMain.append("defs").append("clipPath")
            .attr("id", "mainClip")
            .append("rect")
            .attr("width", this.width)
            .attr("height", this.mainHeight);


        this.main = chartMain.append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
            .attr("width", this.width)
            .attr("height", this.mainHeight)
            .attr("class", "main");
    }
    initMainItemsLayerOnTopOfBrush(){
          this.main.append("g")
            .attr("id", "mainItemsId")
            .attr("clip-path", "url(#mainClip)");
    }

    initMiniChart(el) {
        let chartMini = d3.select(el)
            .append("svg")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.miniHeight + this.margin.bottom);

        this.mini = chartMini.append("g")
            .attr("transform", "translate(" + this.margin.left + ",0)")
            .attr("width", this.width)
            .attr("height", this.miniHeight)
            .attr("class", "mini");

        this.mini.append("g")
            .attr("id", "miniItemsId");
    }

    initMainAxis() {
        this.xAxisMain = d3.axisTop(this.xScaleMain)
            .tickFormat(d3.timeFormat(this.tickFormat))
            .ticks(20)
            .tickSize(this.mainHeight)
            .tickPadding(4);

        var yAxisMain = d3.axisLeft(this.yScaleMain)
            .tickSize(0)
            .tickPadding(-90);

        this.main.append("g").attr("class", "x axis")
            .attr("transform", "translate(0, " + (this.mainHeight) + ")")
            .transition()
            .call(this.xAxisMain);

        this.main.append("g").attr("class", "y axis")
            .transition()
            .call(yAxisMain);
    }

    initMiniAxis() {
        // miniBrush is on top of items layer and  axis labels is on top of items

        var xAxisMini = d3.axisBottom(this.xScaleMini)
            .tickFormat(d3.timeFormat(this.tickFormat))
            .ticks(d3.timeMinute, 60)
            .tickSize(3)
            .tickPadding(4);

        this.mini.append("g").attr("class", "x axis")
            .attr("transform", "translate(0, " + this.miniHeight + ")")
            .transition()
            .call(xAxisMini);
    }

    initMainBrush() {
        this.mainBrush = d3.brushX()
            .on("start", () => this.selectionToolBrushStart())
            .on("end", () => this.selectionToolBrushEnd())
            .on("brush", () => this.selectionToolBrushing());

        this.main.append('g')
            .attr('class', 'mainBrush').call(this.mainBrush);
    }

    initMiniBrush() {
        this.miniBrush = d3.brushX()
            .on("brush", () => this.displaySelectedInMain());

        this.mini.append("g")
            .attr("class", "miniBrush")
            .call(this.miniBrush);
    }

    changeDay(day) {

        // if 'day' is undefined, exit
        if (!day) {
            logger.debug("Not changeing, no day.")
            return;
        }
        logger.debug('Changing day: ' + day);
        //Remove everything
        this.mini.selectAll('.miniItems').remove();
        this.main.selectAll('.mainItems').remove();

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

        logger.debug("Setting miniBrush to:", start, end);
        this.miniBrush.extent([start, end]);

        this.mini.select(".miniBrush").call(this.miniBrush.move, [this.xScaleMini(start), this.xScaleMini(end)])

        logger.debug("Move applied to mini brush")
    }

    updateDomain(day) {
        // Update time domain
        var timeDomainStart = day;
        //console.log("Update time domain: ", timeDomainStart)
        var timeDomainEnd = d3.utcDay.offset(timeDomainStart, 1);
        this.xScaleMini.domain([timeDomainStart, timeDomainEnd]);
    }

    addItemsToTimeline(trackItems) {
        console.log('addItemsToTimeline', trackItems.length);
        this.allItems.push(...trackItems);

        //mini item rects
        var rects = this.mini.select("#miniItemsId").selectAll(".miniItems")
            .data(this.allItems);


        //Update old items
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

        //enter new items
        rects.enter()
            .append("rect")
            .attr("class", "miniItems")
            .attr("id", (d) => {
                return "mini_" + d.id;
            })
            .attr("height", 7)
            //Apply same as "Update old items"
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

        logger.debug("Displaying selected in main");
        this.displaySelectedInMain();
    }

    cleanDataAndAddItemsToTimeline(trackItems) {
        console.log('cleanDataAndAddItemsToTimeline');
        this.allItems = [];
        this.addItemsToTimeline(trackItems);
    }

    displaySelectedInMain() {

        var extent = d3.brushSelection(this.mini.select(".miniBrush").node());

        logger.debug("extent", extent)
        let minExtent = this.xScaleMini.invert(extent[0]);
        let maxExtent = this.xScaleMini.invert(extent[1]);
        let visItems = this.allItems.filter((d) => {
            return new Date(d.beginDate) <= maxExtent && new Date(d.endDate) >= minExtent;
        });

        logger.debug("Displaying minExtent <> maxExtent", minExtent, maxExtent);

        this.xScaleMain.domain([minExtent, maxExtent]);
        //xAxisMain.scale(xScaleMain);
        this.main.select(".x.axis").call(this.xAxisMain);

        var rects = this.main.select("#mainItemsId").selectAll(".mainItems")
            .data(visItems);

        //remove
        rects.exit().remove();

        //update
        rects
            .style("fill", (d) => {
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

        // insert
        rects.enter().append("rect")
            .attr("class", "mainItems")
            .attr("id", (d) => {
                return "main_" + d.id;
            })
            .attr("height", (d) => {
                return 20;
            })
            // add same style as "update"
            .style("fill", (d) => {
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
            })


        let self = this;
        rects.on('click', function (d, i) { self.onClickTrackItem(d, i, this) })
            .on('mouseover', function (d, i, e) { self.tip.show(d, i, e) })
            .on('mouseout', function (d, i, e) { self.tip.hide(d, i, e) });

    }

    onClickTrackItem(d, i, element) {

        logger.debug("Clicked track item", d, i);
        var p = d3.select(element);
        var data: any = p.data()[0];

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

        // Make brush same size as trackitem
        this.moveMainBrush(new Date(data.beginDate), new Date(data.endDate));

        // prevent event bubbling up, to unselect when clicking outside
        event.stopPropagation();
    }

    initTooltips(addToSvg) {
        console.log("Init tooltip");

        var format = d3.timeFormat("%H:%M:%S");
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

    selectionToolBrushStart() {

        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.

        logger.debug("selectionToolBrushStart");

        if (this.selectedTrackItem !== null && this.selectedTrackItem.taskName !== 'LogTrackItem') {
            logger.debug("selectionToolBrushStart. selectedTrackItem = null");
            this.selectedTrackItem = null;
        }

    };

    selectionToolBrushing() {
        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.

        var selection = d3.event.selection;

        let extent = selection.map(this.xScaleMain.invert, this.xScaleMain);

        logger.debug("selectionToolBrushing extent:", extent);

    }

    selectionToolBrushEnd() {

        if (!d3.event.sourceEvent) return; // Only transition after input.
        if (!d3.event.selection) return; // Ignore empty selections.



        var selection = d3.event.selection;

        let extent = selection.map(this.xScaleMain.invert, this.xScaleMain);

        logger.debug("selectionToolBrushEnd extent:", extent);

        if (extent[0] - extent[1] == 0) {
            logger.debug("Just a click");
            if (this.selectedTrackItem !== null) {
                logger.debug("selectedTrackItem = null")
                this.selectedTrackItem = null;
            }
            return;
        }



        //
        if (!this.selectedTrackItem || !this.selectedTrackItem.id) {
            extent = this.snapDatesToMinute(extent);
        }

        let newTrackItem: any = {};

        if (this.selectedTrackItem == null) {
            logger.debug("Creating new selectedTrackItem");
            this.selectedTrackItem = { color: '#32CD32' };
        }

        newTrackItem.left = d3.select(".mainBrush rect.selection").attr("x") + 'px';
        newTrackItem.beginDate = extent[0];
        newTrackItem.endDate = extent[1];

        logger.debug("selectedTrackItem = newTrackItem", newTrackItem)
        Object.assign(this.selectedTrackItem, newTrackItem);
        // prevent event bubbling up, to unselect when clicking outside
        event.stopPropagation();
    };

    snapDatesToMinute(extent) {
        // change data based on selection brush
        var beginDate: Date = d3.timeMinute.floor(extent[0]);
        var endDate: Date = d3.timeMinute.ceil(extent[1]);
        this.moveMainBrush;
        return [beginDate, endDate];
    }

    moveMainBrush(beginDate, endDate) {
        logger.debug("Moving main brush:", beginDate, endDate);
        this.main.select(".mainBrush").transition().call(this.mainBrush.move, [beginDate, endDate].map(this.xScaleMain));
    }

}
