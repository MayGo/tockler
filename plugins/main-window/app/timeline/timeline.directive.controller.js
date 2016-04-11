'use strict';

angular.module('angularDemoApp')
    .controller('TimelineDirectiveController', function ($scope, $window, $timeout) {
        var ctrl = this;
        //public functions
        ctrl.init = init;
        ctrl.onTrackItemsChanged = onTrackItemsChanged;

        // constants
        var margin = {
            top: 0,
            right: 30,
            bottom: 15,
            left: 10
        };

        var vis;
        var tip;
        var selectionTool;
        var xScale;
        var yScale;
        var xAxis;
        var yAxis;

        var h = 150;
        var w = $window.innerWidth;

        var height = h - margin.top - margin.bottom - 5;
        var width = w - margin.right - margin.left - 5;
        var logTrackItemHeight = (height - (margin.top + margin.bottom)) / 3;
        console.log(height, width);


        // $scope.$on('windowResize', resize);
        // $scope.$watch('tagsize', update);

        function update() {

        }

        /*  $scope.$watchCollection(function () {
         return ctrl.trackItems;
         }, update);*/

        function init(el) {

            vis = d3.select(el)
                .append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)

            tip = initTooltips(vis);

        }

        function initTooltips(addToSvg) {
            console.log("Init tooltip");
            var tooltip = d3.select('body').append('div')
                .style('position', 'absolute')
                .style('padding', '0 10px')
                .style('opacity', 0)
                .attr('class', 'tooltip');

            var format = d3.time.format("%H:%M:%S");
            // set up initial svg object
            var d3tip = d3.tip().attr('class', 'd3-tip').html(function (d) {
                var duration = moment.duration(d.endDate - d.beginDate)
                var formattedDuration = moment.utc(duration.asMilliseconds()).format("HH[h] mm[m] ss[s]");
                // strip leading zeroes
                formattedDuration = formattedDuration.replace('00h 00m', '');
                formattedDuration = formattedDuration.replace('00h ', '');
                return "<strong>" + d.app + ":</strong> <span>" + d.title + "</span><div>" +
                    format(d.beginDate) + " - " + format(d.endDate) + "</div>" +
                    "<div><b>" + formattedDuration + "</b></div>";
            });

            addToSvg.call(d3tip);

            return d3tip;
        }

        function onTrackItemsChanged(newVal, oldVal) {
            console.log('TrackItems changed');
            vis.selectAll('*').remove();
            // if 'val' is undefined, exit
            if (!newVal) {
                return;
            }

            initAxis();

            console.log("Init zoom.");
            var changeZoom = function (scale, x) {

                var size = w * scale;
                x = Math.min(x, 0);
                x = Math.max(x, width - size);

                // Prevent panning error when zoomed out
                if (scale === 1) {
                    x = 0;
                }

                //console.log("Changing zoom, scale: " + scale + ", x: " + x);

                layersGroup.attr("transform", "translate(" + x + ", 1) scale(" + scale + ", 1)");
                zoom.scale(scale).translate([x, 1]);
                vis.select(".x.axis").call(xAxis);

                selectionTool.extent(selectionTool.extent());
                d3.select(".brush").call(selectionTool);

                ctrl.onZoomChanged(scale, x);
            };

            var zoom = d3.behavior.zoom().scaleExtent([1, 100])
                .x(xScale)
                .on("zoom", function () {
                    changeZoom(d3.event.scale, d3.event.translate[0])
                });


            vis.append("g")
                .append("svg:rect")
                .attr("class", "zoom-overlay")
                .attr("x", "0")
                .attr("y", logTrackItemHeight)
                .attr("width", width)
                .attr("height", height).on('click', function () {
                    console.log("Visulation click");
                    if (ctrl.selectedTrackItem != null) {
                        clearBrush();
                    } else {
                        createLogItemBrush();
                    }
                })
                .call(zoom);

            console.log("Init selection tool.");
            var selectionToolBrushEnd = function () {

                console.log("selectionToolBrushEnd");
                // change data based on selection brush
                var beginDate = d3.time.minute.round(selectionTool.extent()[0].getTime());
                var endDate = d3.time.minute.round(selectionTool.extent()[1].getTime());
                console.log(d3.select(".brush rect.extent").attr("x"))
                if (endDate - beginDate == 0) {
                    console.log("Just a click");
                    if (ctrl.selectedTrackItem !== null) {
                        ctrl.selectedTrackItem = null;
                        $scope.$apply();
                    }
                    return;
                }

                if (ctrl.selectedTrackItem == null) {
                    ctrl.selectedTrackItem = {color: '#32CD32'};
                }

                ctrl.selectedTrackItem.left = d3.select(".brush rect.extent").attr("x") + 'px';
                ctrl.selectedTrackItem.beginDate = beginDate;
                ctrl.selectedTrackItem.endDate = endDate;

                $scope.$apply();
                // prevent event bubbling up, to unselect when clicking outside
                event.stopPropagation();
            };

            selectionTool = d3.svg.brush().x(xScale)
                .on("brushend", selectionToolBrushEnd)
                .on("brush", function () {
                    console.log("brushing");
                    var ext = selectionTool.extent()
                    d3.select(".left-handle").attr("x", xScale(ext[0]) - 5);
                    d3.select(".right-handle").attr("x", xScale(ext[1]) - 7);
                });


            vis.append('g')
                .attr('class', 'brush').call(selectionTool)
                .selectAll("rect")
                .attr('height', logTrackItemHeight);

            // Add handles
            var arc = d3.svg.arc()
                .outerRadius((logTrackItemHeight - 5) / 2)
                .startAngle(0)
                .endAngle(function (d, i) {
                    return i ? -Math.PI : Math.PI;
                });

            d3.select(".brush").selectAll(".resize").append("path")
                .attr("transform", "translate(0," + logTrackItemHeight / 2 + ")")
                .attr("d", arc);


            var clearBrush = function () {
                if (ctrl.selectedTrackItem != null) {
                    console.log("Clear brush");
                    console.log(ctrl.selectedTrackItem);
                    // Hide selection brushes
                    selectionTool.clear();
                    d3.select(".brush").call(selectionTool);
                    d3.select(".brush").selectAll("rect")
                        .attr('height', logTrackItemHeight).attr("transform", null)
                    ctrl.selectedTrackItem = null;
                    $scope.$apply();
                }
            };
            var createLogItemBrush = function () {
                if (ctrl.selectedTrackItem == null) {
                    console.log("createLogItemBrush");
                    // Hide selection brushes
                    /*
                     ctrl.selectedTrackItem = {
                     beginDate:
                     endDate:
                     };
                     $scope.$apply();*/
                }
            };

            console.log("Init layers.");

            var clipPath = vis.append("defs").append("svg:clipPath")
                .attr("id", "clip")
                .append("svg:rect")
                .attr("id", "clip-rect")
                .attr("x", "0")
                .attr("y", "0")
                .attr("width", width)
                .attr("height", height);

            var layersGroup = vis.append('g').attr("clip-path", "url(#clip)").append('g').attr('class', 'trackItems');


            var layers = layersGroup.selectAll("g.layer")
                .data(newVal, function (d) {
                    return d.id;
                })
                .enter().append("rect").attr('class', 'trackItem').style("fill", function (d) {
                    return d.color;
                }).attr("y", 0).attr("x", function (d) {
                    return xScale(d.beginDate);
                }).attr("transform", function (d) {
                    return "translate(" + 0 + "," + yScale(d.taskName) + ")";
                }).attr("height", function (d) {
                    return yScale.rangeBand();
                }).attr("width", function (d) {
                    if ((xScale(d.endDate) - xScale(d.beginDate)) < 0) {
                        console.error("Negative value, error with dates.");
                        console.log(d);
                        return 0;
                    }
                    return (xScale(d.endDate) - xScale(d.beginDate));
                })
                .on('click', onClickTrackItem)
                .on('mouseover', tip.show)
                .on('mouseout', tip.hide);

            if (ctrl.zoomX && ctrl.zoomScale) {
                // using timeout to prevent xAxis update bug (ticks not scaled evenly)
                $timeout(function () {
                    changeZoom(ctrl.zoomScale, ctrl.zoomX);
                }, 100);
            }
        }

        function initAxis() {
            console.log("Init axis.");
            var tickFormat = "%H:%M";
            var startDate = ctrl.startDate;
            var timeDomainStart = startDate;
            var timeDomainEnd = d3.time.day.offset(startDate, 1);

            var trackNames = ["LogTrackItem", "StatusTrackItem", "AppTrackItem"];
            xScale = d3.time.scale().domain([timeDomainStart, timeDomainEnd]).range([0, width]).clamp(true);
            yScale = d3.scale.ordinal().domain(trackNames).rangeRoundBands([0, height - margin.top - margin.bottom], .1);

            xAxis = d3.svg.axis().scale(xScale).orient("bottom")
                .tickFormat(d3.time.format(tickFormat))
                .ticks(d3.time.minute, 60)
                .tickSize(8)
                .tickPadding(8);
            yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(5).tickSize(-2).tickPadding(-90);

            vis.append("g").attr("class", "x axis")
                .attr("transform", "translate(0, " + (height - margin.top - margin.bottom) + ")")
                .transition()
                .call(xAxis);
            vis.append("g").attr("class", "y axis").transition().call(yAxis);
        }

        function onClickTrackItem(d, i) {

            console.log("onClickTrackItem");


            var p = d3.select(this);
            var data = p.data()[0];

            var selectionToolSvg = d3.select(".brush");
            var traslate = p.attr('transform');
            var x = new Number(p.attr('x'));
            var y = new Number(p.attr('y'));

            // Create object from TrackItem object, to prevent updating trackitem
            ctrl.selectedTrackItem = {
                id: data.id,
                taskName: data.taskName,
                beginDate: data.beginDate,
                endDate: data.endDate,
                title: data.title,
                color: data.color,
                left: x + 'px'
            };
            $scope.$apply();


            // position brush same as trackitem
            selectionToolSvg.selectAll("rect").attr('height', p.attr('height')).attr("transform", traslate);
            //   d3.select("g.brush").call((brush.empty())
            // to make unselecting work correctly
            selectionTool.x(xScale);

            // Make brush same size as trackitem
            selectionTool.extent([data.beginDate, data.endDate]);
            selectionToolSvg.call(selectionTool);

            // remove crosshair outside of item
            selectionToolSvg.select(".background").attr('width', 0);


            // add handles
            var ext = selectionTool.extent();
            d3.select(".left-handle").attr("x", xScale(ext[0]) - 5);
            d3.select(".right-handle").attr("x", xScale(ext[1]) - 7);

            // prevent event bubbling up, to unselect when clicking outside
            event.stopPropagation();

        };

    });
