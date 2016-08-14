'use strict';

angular.module('angularDemoApp')
    .controller('TimelineDirectiveController', function ($scope, $window, $timeout) {
        var ctrl = this;
        //public functions
        ctrl.init = init;
        ctrl.changeDay = changeDay;

        ctrl.addItemsToTimeline = addItemsToTimeline;

        // constants
        var margin = {
            top: 20,
            right: 30,
            bottom: 15,
            left: 10
        };

        var h = 250;
        var w = $window.innerWidth;

        var height = h - margin.top - margin.bottom - 5;
        var width = w - margin.right - margin.left - 5;

        var lanes = ["LogTrackItem", "StatusTrackItem", "AppTrackItem"];

        var mainHeight = 70;
        var miniHeight = 30;


        console.log(miniHeight, mainHeight);
        var logTrackItemHeight = (height - (margin.top + margin.bottom)) / 3;
        console.log(height, width);


        var timeDomainStart = moment().startOf('day').toDate();
        var timeDomainEnd = d3.time.day.offset(timeDomainStart, 1);

        //scales

        var xScaleMain = d3.time.scale()
            .domain([timeDomainStart, timeDomainEnd])
            .range([0, width])
            .clamp(true);

        var yScaleMain = d3.scale.ordinal()
            .domain(lanes)
            .rangeRoundBands([0, mainHeight], .1);

        var xScaleMini = d3.time.scale()
            .domain([timeDomainStart, timeDomainEnd])
            .range([0, width])
            .clamp(true);

        var yScaleMini = d3.scale.ordinal()
            .domain(lanes)
            .rangeRoundBands([0, miniHeight], .1);

        var chart;
        var main;
        var mini;
        var brush;

        var allItems = [];
        var xAxisMain;

        function init(el) {
            chart = d3.select(el)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .attr("class", "chart");

            chart.append("defs").append("clipPath")
                .attr("id", "clip")
                .append("rect")
                .attr("width", width)
                .attr("height", mainHeight);

            main = chart.append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("width", width)
                .attr("height", mainHeight)
                .attr("class", "main");

            mini = chart.append("g")
                .attr("transform", "translate(" + margin.left + "," + (mainHeight + margin.top) + ")")
                .attr("width", width)
                .attr("height", miniHeight)
                .attr("class", "mini");

            // MAIN AXIS

            var tickFormat = "%H:%M";

            xAxisMain = d3.svg.axis()
                .scale(xScaleMain)
                .orient("top")
                .tickFormat(d3.time.format(tickFormat))
                .ticks(20)
                .tickSize(mainHeight)
                .tickPadding(4);

            var yAxisMain = d3.svg.axis()
                .scale(yScaleMain)
                .orient("left")
                .tickSize(-2)
                .tickPadding(-90);

            main.append("g").attr("class", "x axis")
                .attr("transform", "translate(0, " + (mainHeight ) + ")")
                .transition()
                .call(xAxisMain);

            // track items clip
            // y axis labels is on top of items
            main.append("g")
                .attr("id", "mainItemsId")
                .attr("clip-path", "url(#clip)");

            main.append("g").attr("class", "y axis")
                .transition()
                .call(yAxisMain);

            // MINI AXIS
            // brush is on top of items layer and  axis labels is on top of items
            mini.append("g")
                .attr("id", "miniItemsId");

            var xAxisMini = d3.svg.axis()
                .scale(xScaleMini)
                .orient("bottom")
                .tickFormat(d3.time.format(tickFormat))
                .ticks(d3.time.minute, 60)
                .tickSize(3)
                .tickPadding(4);

            var yAxisMini = d3.svg.axis()
                .scale(yScaleMini)
                .orient("left")
                .tickSize(-2)
                .tickPadding(-90);

            mini.append("g").attr("class", "x axis")
                .attr("transform", "translate(0, " + miniHeight + ")")
                .transition()
                .call(xAxisMini);
            mini.append("g").attr("class", "y axis")
                .transition()
                .call(yAxisMini);

            //brush
            brush = d3.svg.brush()
                .x(xScaleMini)
                .on("brush", displaySelectedInMain);

            mini.append("g")
                .attr("class", "x brush")
                .call(brush)
                .selectAll("rect")
                .attr("y", 1)
                .attr("height", miniHeight);
        }

        function changeDay(day) {

            // if 'day' is undefined, exit
            if (!day) {
                console.log("Not changeing, no day.")
                return;
            }
            console.log('Changing day: ' + day);
            //Remove everything
            mini.select("#miniItemsId").selectAll('.miniItems').remove();
            main.select("#mainItemsId").selectAll('.mainItems').remove();
            allItems = [];
            //updateDomain(day)
        }

        function addItemsToTimeline(trackItems) {
            console.log('addItemsToTimeline', trackItems.length);
            allItems.push(...trackItems);

            //mini item rects
            mini.select("#miniItemsId").selectAll(".miniItems")
                .data(trackItems, function (d) {
                    return d.id;
                })
                .enter()
                .append("rect")
                .style("fill", function (d) {
                    return d.color;
                })
                .attr("class", function (d) {
                    return "miniItems" ;
                })
                .attr("x", function (d) {
                    return xScaleMini(new Date(d.beginDate));
                })
                .attr("y", function (d) {
                    return yScaleMini(d.taskName);
                })
                .attr("width", function (d) {
                    if ((xScaleMini(new Date(d.endDate)) - xScaleMini(new Date(d.beginDate))) < 0) {
                        console.error("Negative value, error with dates.");
                        console.log(d);
                        return 0;
                    }
                    return (xScaleMini(new Date(d.endDate)) - xScaleMini(new Date(d.beginDate)));

                })
                .attr("height", 7);
            drawBrush();
            displaySelectedInMain();
        }


        function displaySelectedInMain() {

            var rects,
                minExtent = brush.extent()[0],
                maxExtent = brush.extent()[1],
                visItems = allItems.filter(function (d) {
                    return new Date(d.beginDate) <= maxExtent && new Date(d.endDate) >= minExtent;
                });
            console.log("Displaying minExtent <> maxExtent", minExtent, maxExtent);

            mini.select(".brush")
                .call(brush.extent([minExtent, maxExtent]));

            console.log("Updating main view scale and axis");
            xScaleMain.domain([minExtent, maxExtent]);
            //xAxisMain.scale(xScaleMain);
            main.select(".x.axis").call(xAxisMain);

            //update main item rects
            rects = main.select("#mainItemsId").selectAll(".mainItems")
                .data(visItems, function (d) {
                    return d.id;
                })
                .attr("x", function (d) {
                    return xScaleMain(new Date(d.beginDate));
                })
                .attr("width", function (d) {
                    return xScaleMain(new Date(d.endDate)) - xScaleMain(new Date(d.beginDate));
                });

            rects.enter().append("rect")
                .attr("class", function (d) {
                    return "mainItems";
                })
                .style("fill", function (d) {
                    return d.color;
                })
                .attr("x", function (d) {
                    return xScaleMain(new Date(d.beginDate));
                })
                .attr("y", function (d) {
                    return yScaleMain(d.taskName);
                })
                .attr("width", function (d) {
                    return xScaleMain(new Date(d.endDate)) - xScaleMain(new Date(d.beginDate));
                })
                .attr("height", function (d) {
                    return 20;
                });

            rects.exit().remove();

        }

        function drawBrush() {

            var start = moment().subtract(1, 'hours').toDate();
            var end = moment().add(10, 'minutes').toDate();
            console.log("Setting brush to:", start, end);
            brush.extent([start, end]);

        }

    });
