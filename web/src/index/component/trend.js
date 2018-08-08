/**
 * @file response
 * @author cuiyuan
 */

import './trend.less';

import React, {Component} from 'react';
import {hashHistory} from 'react-router';
import {axiosInstance} from '../../tools/axiosInstance';
import eventProxy from '../../tools/eventProxy';
import Chart from '../../common/baseComponent/chart';
import UploadData from '../../common/baseComponent/uploadData';
import img from '../../common/image/background-image.png';
import moment from 'moment';
import $ from 'jquery';
import Band from '../../common/baseComponent/band';
import cookie from 'react-cookies';
import Highcharts from 'react-highcharts/ReactHighstock';

const api = require('../../common/api').default.api;
const dateFormat = 'YYYY-MM-DD HH:mm';
const keyArr = [38, 87, 40, 83, 37, 65, 39, 68];

export default class Trend extends Component {
    constructor(props) {
        super(props);

        let self = this;
        this.state = {
            // Whether to display a mask, true means display, false means not selected
            loading: true,
            // Label mode, simple or complex. Simple means that only the selected points are processed, and complex means that the selected points are visually optimized.
            selectType: 'complex',
            // Trend map configuration
            options: {
                lang: {
                    noData: 'No data found in the uploaded file, please check.'
                },
                colors: ['#7cb5ec', '#80699B', '#90ed7d', '#f7a35c', '#8085e9',
                    '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
                noData: {
                    style: {
                        fontWeight: 'normal',
                        fontSize: '12px',
                        color: '#ccc'
                    }
                },
                chart: {
                    height: 500,
                    zoomType: 'x',
                    events: {
                        load: function () {},
                        selection: function (e) {
                            e.preventDefault();
                            return self.selection(e, self.state.selectType);
                        }
                    }
                },
                title: {
                    text: '',
                    style: {
                        fontSize: '16px'
                    }
                },
                scrollbar: {
                    enabled: true,
                    height: 0,
                    buttonArrowColor: 'transparent',
                    liveRedraw: false
                },
                navigator: {
                    adaptToUpdatedData: false,
                    enabled: true,
                    maskFill: 'rgba(56,143,247,0.3)',
                    height: 60,
                    outlineWidth: 0,
                    series: {
                        data: [],
                        type: 'line',
                        color: '#388FF7',
                        fillOpacity: 0,
                        dataGrouping: {
                            smoothed: true
                        },
                        lineWidth: 1,
                        lineColor: '#388FF7',
                        marker: {
                            enabled: false
                        },
                        name: 'sample demo'
                    },
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        second: '%Y-%m-%d<br/>%H:%M:%S',
                        minute: '%Y-%m-%d<br/>%H:%M',
                        hour: '%Y-%m-%d<br/>%H:%M',
                        day: '%Y<br/>%m-%d',
                        week: '%Y<br/>%m-%d',
                        month: '%Y-%m',
                        year: '%Y'
                    },
                    animation: false
                },
                rangeSelector: {
                    buttons: [{
                        type: 'second',
                        count: 3600,
                        text: '1h'
                    }, {
                        type: 'second',
                        count: 21600,
                        text: '6h'
                    }, {
                        type: 'second',
                        count: 43200,
                        text: '12h',
                        dataGrouping: {
                            units: [
                                ['second', [1]]
                            ]
                        }
                    }, {
                        type: 'second',
                        count: 86400,
                        text: '1d',
                        dataGrouping: {
                            units: [
                                ['second', [1]]
                            ]
                        }
                    }, {
                        type: 'second',
                        count: 259200,
                        text: '3d',
                        dataGrouping: {
                            units: [
                                ['second', [1]]
                            ]
                        }
                    }, {
                        type: 'second',
                        count: 604800,
                        text: '7d',
                        dataGrouping: {
                            units: [
                                ['second', [1]]
                            ]
                        }
                    }, {
                        type: 'second',
                        count: 1209600,
                        text: '14d',
                        dataGrouping: {
                            units: [
                                ['second', [1]]
                            ]
                        }
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    inputEnabled: false,
                    buttonPosition: {
                        x: -5
                    },
                    buttonSpacing: 10,
                    buttonTheme: {
                        // styles for the buttons
                        'fill': 'none',
                        'stroke-width': 1,
                        'r': 1,
                        'style': {
                            color: '#aaa',
                            textShadow: 'none'
                        },
                        'states': {
                            hover: {
                                fill: '#388ff7',
                                style: {
                                    color: 'white',
                                    cursor: 'pointer',
                                    textShadow: 'none'
                                }
                            },
                            select: {
                                fill: '#388ff7',
                                style: {
                                    color: 'white',
                                    textShadow: 'none'
                                }
                            }
                        }
                    },
                    labelStyle: {
                        display: 'none'
                    }
                },
                tooltip: {
                    shared: false,
                    enabled: true,
                    backgroundColor: '#fff',
                    borderRadius: 1,
                    borderWidth: 0,
                    shadow: true,
                    animation: true,
                    style: {
                        fontSize: '12px',
                        pointerEvents: 'auto',
                        width: '100px'
                    },
                    useHTML: true,
                    formatter: function (e) {
                        return self.tooltipFormatter(e, this);
                    },
                    followPointer: false,
                    hideDelay: 5000,
                    stickyTracking: false,
                    positioner: function (w,h,p) {
                        return {x: p.plotX + self.chart.plotLeft, y: p.plotY + self.chart.plotTop};
                    },
                    outside: true
                },
                xAxis: {
                    crosshair: false,
                    events: {
                        afterSetExtremes: function (e) {
                            return self.afterSetExtremes(e);
                        }
                    },
                    type: 'datetime',
                    dateTimeLabelFormats: {
                        second: '%Y-%m-%d<br/>%H:%M:%S',
                        minute: '%Y-%m-%d<br/>%H:%M',
                        hour: '%Y-%m-%d<br/>%H:%M',
                        day: '%Y<br/>%m-%d',
                        week: '%Y<br/>%m-%d',
                        month: '%Y-%m',
                        year: '%Y'
                    },
                    categories: []
                },
                yAxis: {
                    opposite: false,
                    startOnTick: false,
                    showLastLabel: true
                },
                legend: {
                    enabled: false,
                    symbolRadius: 0,
                    symbolWidth: 25,
                    squareSymbol: false,
                    align: 'right',
                    backgroundColor: '#fff',
                    borderWidth: 0,
                    layout: 'vertical',
                    verticalAlign: 'top',
                    y: 20,
                    x: 20,
                    width: 150,
                    itemMarginTop: 5,
                    itemMarginBottom: 10
                },
                plotOptions: {
                    line: {
                        // boostThreshold: 200,
                        marker: {
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        },
                        point: {
                            events: {}
                        },
                        tooltip: {
                            hideDelay: 5000
                        },
                        turboThreshold: 3000
                    },
                    area: {
                        point: {
                            events: {}
                        },
                        animation: false,
                        trackByArea: true,
                        connectNulls: false
                    },
                    series: {
                        stickyTracking: false,
                        turboThreshold: 3000,
                        marker: {
                            states: {
                                hover: {
                                    enabled: true
                                }
                            }
                        },
                        states: {
                            hover: {
                                enabled: false
                            }
                        },
                        events: {
                        },
                        animation: false
                    }
                },
                series: []
            },
            // The maximum value of the data (the rightmost value of the thumbnail)
            extremesMax: undefined,
            // The minimum value of the data (the leftmost value of the thumbnail)
            extremesMin: undefined,
            // Operation menu list
            menuList: [],
            // Auxiliary bands display set
            bands: [],
            // Trend object
            chart: {}
        };
        this.chartOptions = {
            lang: {
                noData: 'No data found in the uploaded file, please check.'
            },
            colors: ['#7cb5ec', '#80699B', '#90ed7d', '#f7a35c', '#8085e9',
                '#f15c80', '#e4d354', '#8085e8', '#8d4653', '#91e8e1'],
            noData: {
                style: {
                    fontWeight: 'normal',
                    fontSize: '13px',
                    color: '#ccc'
                }
            },
            chart: {
                height: 660,
                zoomType: 'x',
                events: {
                    load: function () {},
                    selection: function (e) {
                        e.preventDefault();
                        return self.selection(e, self.state.selectType);
                    }
                },
                borderRadius: 8,
                backgroundColor: '#0d0836',
                spacingBottom: 45,
                spacingLeft: 30,
                spacingRight: 44,
                spacingTop: 60
                // ,
                // animation: {
                //     duration: 0
                // }
                // animation: false
            },
            title: {
                text: '',
                style: {
                    fontSize: '16px'
                }
            },
            scrollbar: {
                enabled: true,
                height: 0,
                buttonArrowColor: 'transparent',
                liveRedraw: false
            },
            navigator: {
                adaptToUpdatedData: false,
                enabled: true,
                maskFill: 'rgba(47, 73, 255, 0.3)',
                height: 60,
                outlineWidth: 0,
                series: {
                    data: [],
                    type: 'line',
                    color: '#0c3946',
                    fillOpacity: 0,
                    dataGrouping: {
                        smoothed: true
                    },
                    lineWidth: 1,
                    marker: {
                        enabled: false
                    },
                    name: 'sample demo'
                },
                type: 'datetime',
                dateTimeLabelFormats: {
                    second: '%Y-%m-%d<br/>%H:%M:%S',
                    minute: '%Y-%m-%d<br/>%H:%M',
                    hour: '%Y-%m-%d<br/>%H:%M',
                    day: '%Y<br/>%m-%d',
                    week: '%Y<br/>%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                },
                animation: false,
                xAxis: {
                    labels: {
                        style: {
                            color: 'rgba(204, 204, 204, 0.6)'
                        },
                        format: '{value:%Y-%m-%d<br/>%H:%M:%S}',
                        align: 'center',
                        y: 20
                    }
                },
                margin: 35
            },
            rangeSelector: {
                buttons: [{
                    type: 'second',
                    count: 3600,
                    text: '1h'
                }, {
                    type: 'second',
                    count: 21600,
                    text: '6h'
                }, {
                    type: 'second',
                    count: 43200,
                    text: '12h',
                    dataGrouping: {
                        units: [
                            ['second', [1]]
                        ]
                    }
                }, {
                    type: 'second',
                    count: 86400,
                    text: '1d',
                    dataGrouping: {
                        units: [
                            ['second', [1]]
                        ]
                    }
                }, {
                    type: 'second',
                    count: 259200,
                    text: '3d',
                    dataGrouping: {
                        units: [
                            ['second', [1]]
                        ]
                    }
                }, {
                    type: 'second',
                    count: 604800,
                    text: '7d',
                    dataGrouping: {
                        units: [
                            ['second', [1]]
                        ]
                    }
                }, {
                    type: 'second',
                    count: 1209600,
                    text: '14d',
                    dataGrouping: {
                        units: [
                            ['second', [1]]
                        ]
                    }
                }],
                inputEnabled: false,
                buttonPosition: {
                    x: 0,
                    y: -33
                },
                buttonSpacing: 15,
                buttonTheme: {
                    // styles for the buttons
                    'fill': 'none',
                    'stroke-width': 1,
                    'r': 1,
                    'style': {
                        color: 'rgba(255, 255, 255, 0.3)',
                        textShadow: 'none',
                        fontWeight: 'normal'
                    },
                    'states': {
                        hover: {
                            fill: '#388ff7',
                            style: {
                                color: '#fff',
                                cursor: 'pointer',
                                textShadow: 'none',
                                fontWeight: 'normal'
                            }
                        },
                        select: {
                            fill: '#388ff7',
                            style: {
                                color: '#fff',
                                cursor: 'pointer',
                                textShadow: 'none',
                                fontWeight: 'normal'
                            }
                        },
                        disabled: {
                            style: {
                                color: 'rgba(255, 255, 255, 0.1)',
                                cursor: 'not-allowed',
                                textShadow: 'none',
                                fontWeight: 'normal'
                            }
                        }
                    }
                },
                labelStyle: {
                    display: 'none'
                }
            },
            loading: {
                style: {
                    backgroundColor: '#12104f',
                    opacity: 0.5
                },
                labelStyle: {
                    fontSize: '12px',
                    color: '#fff',
                    opacity: 0.6
                }
            },
            tooltip: {
                shared: false,
                enabled: false,
                backgroundColor: '#fff',
                borderRadius: 1,
                borderWidth: 0,
                shadow: true,
                animation: true,
                style: {
                    fontSize: '12px',
                    pointerEvents: 'auto'
                },
                useHTML: true,
                // formatter: tooltipFormatterFunction,
                hideDelay: 5000
            },
            xAxis: {
                crosshair: false,
                events: {
                    // afterSetExtremes: afterSetExtremesFunction
                },
                type: 'datetime',
                dateTimeLabelFormats: {
                    second: '%Y-%m-%d<br/><br/>%H:%M:%S',
                    minute: '%Y-%m-%d<br/><br/>%H:%M',
                    hour: '%Y-%m-%d<br/><br/>%H:%M',
                    day: '%Y<br/><br/>%m-%d',
                    week: '%Y<br/><br/>%m-%d',
                    month: '%Y-%m',
                    year: '%Y'
                },
                categories: [],
                tickColor: '#979797',
                tickLength: 5
            },
            yAxis: {
                // max: max,
                // min: min,
                opposite: false,
                startOnTick: false,
                lineWidth: 0,
                showFirstLabel: true,
                showLastLabel: true
            },
            legend: {
                enabled: false,
                symbolRadius: 0,
                symbolWidth: 25,
                squareSymbol: false,
                align: 'right',
                backgroundColor: '#fff',
                borderWidth: 0,
                layout: 'vertical',
                verticalAlign: 'top',
                y: 20,
                x: 20,
                width: 150,
                itemMarginTop: 5,
                itemMarginBottom: 10
            },
            plotOptions: {
                line: {
                    // boostThreshold: 200,
                    marker: {
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    },
                    point: {
                        events: {}
                    },
                    tooltip: {
                        hideDelay: 5000
                    },
                    turboThreshold: 3000
                },
                area: {
                    point: {
                        events: {}
                    },
                    animation: false,
                    trackByArea: true,
                    connectNulls: false
                },
                series: {
                    stickyTracking: false,
                    turboThreshold: 3000,
                    marker: {
                        states: {
                            hover: {
                                enabled: true
                            }
                        }
                    },
                    states: {
                        hover: {
                            enabled: false
                        }
                    },
                    events: {
                    }
                    ,
                    // point: {
                    //     events: {
                    //         mouseOver: mouseOverFunction
                    //     }
                    // },
                    animation: false
                }
            }
        };
        this.returnChart = this.returnChart.bind(this);
        this.redrawTrend = this.redrawTrend.bind(this);
        this.selectedPoint = [];
        this.selectedPointIndex = [];
        this.tempSelectedPoint = [];
    }

    componentDidMount() {
        const self = this;
        $('body').on('keydown', e => {
            let t = e.keyCode || e.which || e.charCode;
            if (t && keyArr.indexOf(t) !== -1) {
                e.preventDefault();
                this.keyboardOpera(e);
            }
            if (t === 32) {
                e.preventDefault();
                this.spacebarDown = true
            }
        });

        $('body').on('keyup', e => {
            let t = e.keyCode || e.which || e.charCode;
            if (t === 32) {
                setTimeout(() => {
                    this.spacebarDown = false;
                }, 800);
            }
        });

        $('body').delegate('.selection li', 'click', function (e) {
            e.stopPropagation();
            let action = $(this).attr('data-action');
            let startTime = 0;
            let endTime = 0;
            let currentX = parseInt($(this).attr('data-currentx'), 10);
            let currentLabelItemIndex = 0;
            for (let i = 0; i < self.labelSet.length; i ++) {
                let labelItem = self.labelSet[i];
                if (currentX >= labelItem[0] && currentX <= labelItem[1]) {
                    startTime = labelItem[0];
                    endTime = labelItem[1];
                    currentLabelItemIndex = i;
                    break;
                }
            }
            if (startTime && endTime) {
                self.labelSet.splice(currentLabelItemIndex, 1);
                self.cancelLabel(startTime, endTime, 'simple', e);
            }
        });

        // Operation tooltip label
        $('body').delegate('.label-opera', 'click', function (e) {
            e.stopPropagation();
            let type = $(this).attr('data-action');
            let startTime = 0;
            let endTime = 0;
            let bandName = $(this).attr('data-band-name');
            if (type === 'left') {
                startTime = $(this).attr('data-pre-start-time');
                endTime = $(this).attr('data-pre-end-time');
            }
            else {
                startTime = $(this).attr('data-next-start-time');
                endTime = $(this).attr('data-next-end-time');
            }
            let dataName = self.props.dataName;
            // let url = api.getTrend
            //     + dataName
            //     + '/curves?'
            //     + 'startTime=' + startTime
            //     + '&endTime=' + endTime
            //     + '&bandName=' + bandName;
            if (startTime > endTime) {
                eventProxy.trigger('beforeOpenDialog', {
                    dialogTitle: 'Note',
                    dialogContent: 'Error: startTime > endTime.',
                    dialogType: 'alert',
                    dialogShow: true,
                    dialogOverlayBackgroundColor: 'rgba(0, 0, 0, 0.4)'
                });
            }
            else {
                let time = self.chart && self.chart.xAxis[0].getExtremes();
                self.setTrendData(dataName, time.min, time.max);
            }
        });

        // Operation tooltip left and right
        $('body').delegate('.label-opera', 'click', function (e) {
            e.stopPropagation();
            let startTime = $(this).attr('data-current-start-time');
            let endTime = $(this).attr('data-current-end-time');
            self.label(startTime, endTime, 'simple', e);
        });
    }

    shouldComponentUpdate(nextProps) {
        if (this.props.list === nextProps.list
            && this.props.dataName === nextProps.dataName
            // && this.props.foldMenu === nextProps.foldMenu
        ) {
            return true;
        }

        this.getTrendData(nextProps);
        this.getThumbDate(nextProps);
        this.getMenuList(nextProps);
        return false;
    }

    componentWillUnmount() {
        $('body').off('keydown');
        $('body').off('keyup');
        $('body').undelegate('.selection li', 'click');
        $('body').undelegate('.load-trend', 'click');
        $('body').undelegate('.label-opera', 'click');
        this.setState = (state,callback)=>{
            return;
        };
    }

    keyboardOpera(e) {
        // keyDown
        let chart = this.chart;
        let extremes = chart && chart.xAxis[0].getExtremes();
        let currentMax = extremes.max;
        let currentMin = extremes.min;
        let diff = currentMax - currentMin;
        let extremesMax = this.state.extremesMax;
        let extremesMin = this.state.extremesMin;
        let keyCode = e.keyCode;
        let dataName = this.props.dataName;
        // 38, 87: enlarge
        // 40, 83: Shrink down
        // 37, 65: Left shift
        // 39, 68: Right shift
        let step = diff * 0.25;
        let newMax;
        let newMin;
        let operaType;
        if (keyCode === 38 || keyCode === 86) {
            // Maximum minus step, minimum plus step
            newMax = currentMax - step;
            newMin = currentMin + step;
            operaType = 'enlarge';
        }
        else if (keyCode === 40 || keyCode === 83) {
            // Maximum plus step, minimum minus step
            newMax = currentMax + step;
            newMin = currentMin - step;
            operaType = 'shrink';
        }
        else if (keyCode === 37 || keyCode === 65) {
            // Both the maximum and minimum values are reduced by step
            newMax = currentMax - step;
            newMin = currentMin - step;
            operaType = 'left';
        }
        else if (keyCode === 39 || keyCode === 68) {
            // Both maximum and minimum plus step
            newMax = currentMax + step;
            newMin = currentMin + step;
            operaType = 'right';
        }
        else {
            newMax = currentMax;
            newMin = currentMin;
        }
        let time = this.getKeyboardOperaExtremes(Math.round(newMax), Math.round(newMin), currentMax, currentMin, extremesMax, extremesMin, operaType);
        this.setTrendData(dataName, time.startTime, time.endTime, this.getRangeSelectorButtonSelected(time.endTime - time.startTime, 'count'), true);
        chart && chart.xAxis[0].setExtremes(time.startTime, time.endTime, false);
    }

    selection(e, selectType) {
        let selectedMax = Math.round(e.xAxis[0].max);
        let selectedMin = Math.round(e.xAxis[0].min);
        if (this.spacebarDown) {
            this.cancelLabel(selectedMin, selectedMax, selectType, e);
            this.spacebarDown = false;
        }
        else {
            this.spacebarDown = false;
            this.label(selectedMin, selectedMax, selectType, e);
        }
    }

    cancelLabel(selectedMin, selectedMax, selectType, e) {
        let dataName = this.props.dataName;
        let chart = this.chart;
        let url = api.labelTrend
            + dataName + '/label'
            + '?startTime=' + selectedMin
            + '&endTime=' + selectedMax
            + '&label=0';
        let time = chart && chart.xAxis[0].getExtremes();
        // if (!selectType || selectType === 'simple') {
            axiosInstance.put(url).then(response => {
                return this.setTrendData(dataName, time.min, time.max);
            }).catch(err => {
                console.log(err);
            });
        // }
        // else {
        //
        // }
    }

    getMenuList(props) {
        let url = api.getTooltipMenu;
        axiosInstance.get(url).then(response => {
            const data = response.data;
            this.setState({
                menuList: data.data
            });
        });
    }

    label(selectedMin, selectedMax, selectType, e) {
        const self = this;
        let dataName = this.props.dataName;
        let chart = this.chart;
        let url = api.labelTrend
            + dataName + '/label'
            + '?startTime=' + selectedMin
            + '&endTime=' + selectedMax
            + '&label=1';
        let time = chart && chart.xAxis[0].getExtremes();
        if (selectType === 'simple') {
            self.setLabel(url, time.min, time.max);
        }
        else if (selectType === 'complex') {
            // Select points
            let currentSelectedPoints = self.selectedPoints(e);
            // filter points
            let currentFinalSelectedPoints = self.filterSelectedPoints(currentSelectedPoints);
            // Paint the selected points
            self.paintPoints(currentFinalSelectedPoints);
            // get params of label operation
            let timeObj = self.getLabelParam(e);
            let url = api.labelTrend
                + dataName + '/label'
                + '?startTime=' + timeObj.startTime
                + '&endTime=' + timeObj.endTime
                + '&label=1';
            axiosInstance.put(url).then(response => {
                // return this.setTrendData(dataName, min, max);
            }).catch(err => {
                console.log(err);
            });
            // self.setLabel(url, time.min, time.max);
            return false;
        }
    }

    setLabel(url, min, max) {
        let dataName = this.props.dataName;
        axiosInstance.put(url).then(response => {
            return this.setTrendData(dataName, min, max);
        }).catch(err => {
            console.log(err);
        });
    }

    getLabelParam(e) {
        let startTime = Math.round(e.xAxis[0].min);
        let endTime = Math.round(e.xAxis[0].max);
        return {
            startTime,
            endTime
        }
    }

    selectedPoints(e) {
        const self = this;
        let chart = self.chart;
        let currentSelectedPoint = [];
        chart.series.forEach(function (series) {
            if (series.type === 'line' && series.name === 'base line') {
                series.points.forEach(point => {
                    if (point.x >= e.xAxis[0].min && point.x <= e.xAxis[0].max) {
                        // self.selectedPoint.push(point);
                        currentSelectedPoint.push(point);
                    }
                });
                // console.log(self.selectedPoint)
            }
        });
        return currentSelectedPoint;
    }

    filterSelectedPoints(currentSelectedPoints) {
        let chart = this.chart;
        // get base line and it's index
        let baseLineIndex = 0;
        chart.series.forEach((item, index) => {
            if (item.type === 'line' && item.name === 'base line') {
                baseLineIndex = index;
            }
        });
        let baseLineData = chart.series[baseLineIndex].data;
        let filterSelectedPoints = currentSelectedPoints;
        let finalSelectedPoints = [];
        let retainSelectedPoint = [];
        // No passing point
        if (filterSelectedPoints.length === 0) {
            // No processing, this labeling is invalid
        }
        // Through a point
        else if (filterSelectedPoints.length === 2) {
            // three solution
            // First point
            if (filterSelectedPoints[0].index === 0) {
                retainSelectedPoint = filterSelectedPoints.slice(1);
                if (retainSelectedPoint[0].index + 1 < baseLineData.length) {
                    retainSelectedPoint.push(baseLineData[retainSelectedPoint[0].index + 1]);
                }
            }
            // Last point
            else if (filterSelectedPoints[1].index === baseLineData.length - 1) {
                retainSelectedPoint = filterSelectedPoints.slice(0, filterSelectedPoints.length - 1);
                if (retainSelectedPoint[0].index - 1 > 0) {
                    retainSelectedPoint.unshift(baseLineData[retainSelectedPoint[0].index - 1]);
                }
            }
            // Somewhere in the middle
            else {
                // remove first point
                retainSelectedPoint = filterSelectedPoints.slice(1);
                if (retainSelectedPoint[0].index + 1 < baseLineData.length) {
                    retainSelectedPoint.push(baseLineData[retainSelectedPoint[0].index + 1]);
                }
            }
        }
        // Through multiple points
        else {
            // remove first point and latest point
            retainSelectedPoint = filterSelectedPoints.slice(1);
            if (retainSelectedPoint[retainSelectedPoint.length - 1].index + 1 < baseLineData.length) {
                retainSelectedPoint.push(baseLineData[retainSelectedPoint[retainSelectedPoint.length - 1].index + 1]);
            }
        }
        finalSelectedPoints = retainSelectedPoint;
        // this.selectedPoint = finalSelectedPoints;
        return finalSelectedPoints;
    }

    paintPoints(currentFinalSelectedPoints) {
        let chart = this.chart;
        let labelLineIndex = 0;
        let baseLineIndex = 0;
        chart.series.forEach((item, index) => {
            if (item.type === 'line' && item.name === 'label line') {
                labelLineIndex =  index;
            }
            if (item.type === 'line' && item.name === 'base line') {
                baseLineIndex = index;
            }
        });
        let baseLineData = this.chart.series[baseLineIndex].data;
        // set this.selectedPoint
        // three source，init/latest selected/current selected
        // init label data
        let currentSelectedPoints = [];
        let selectedPoint = [];
        this.labelSet.forEach(item => {
            selectedPoint = [];
            baseLineData.forEach(data => {
                if (data.x >= item[0] && data.x <= item[1]) {
                    selectedPoint.push(data);
                }
            });
            currentSelectedPoints = this.filterSelectedPoints(selectedPoint);
            this.selectedPoint = this.selectedPoint.concat([...currentSelectedPoints]);
        });
        // latest label data concat current selected
        this.selectedPointIndex = [];
        this.selectedPoint = this.selectedPoint.concat([...currentFinalSelectedPoints]);
        this.selectedPoint.forEach(item => {
            this.selectedPointIndex.push(item.index);
        });

        // add series and remove series
        // find label series and remove it
        chart.series[labelLineIndex].remove(labelLineIndex);
        // add new label line
        let newLabelLineData = [];
        baseLineData.forEach((item, index) => {
            if (this.selectedPointIndex.indexOf(item.index) !== -1) {
                newLabelLineData.push({
                    x: item.x,
                    y: item.y
                    // ,
                    // color: '#ff0000'
                });
            }
            else {
                newLabelLineData.push({
                    x: item.x,
                    y: null
                    // ,
                    // color: '#7cb5ec'
                });
            }
        });
        // show new label line
        chart.addSeries({
            data: newLabelLineData,
            color: '#ff0000',
            zIndex: 100,
            name: 'label line',
            showInLegend: false,
            enableMouseTracking: true,
            zoneAxis: 'x',
            dataGrouping: {
                enabled: false
            }
        });
        console.log(chart)
    }

    tooltipFormatter(e, chart) {
        let points = chart.points;
        let labelLine;
        let area;
        for (let item of points) {
            if (item.series.name === 'label line') {
                labelLine = item;
            }
            if (item.series.type === 'area') {
                area = item;
            }
        }
        let currentX = chart.x;
        let currentY = chart.y;
        return currentX + ' ' + currentY;
        // if (labelLine) {
        //     let menuList = '';
        //     if (this.state.menuList) {
        //         menuList += '<ul class="selection" id="selection">';
        //         for (let i = 0; i < this.state.menuList.length; i ++) {
        //             menuList += ''
        //                 + '<li style="cursor: pointer;" data-action="'
        //                 + this.state.menuList[i].action
        //                 + '" data-currentx="'
        //                 + currentX
        //                 + '">'
        //                 + this.state.menuList[i].name
        //                 + '</li>';
        //         }
        //         menuList += '</ul>';
        //         return menuList;
        //     }
        //     else {
        //         return false;
        //     }
        // }
        // else if (area) {
        //     let band = [];
        //     for (let i = 0; i < this.state.bands.length; i++) {
        //         if (this.state.bands[i].name === area.name) {
        //             // Get the current triggered band
        //             band = this.state.bands[i];
        //             break;
        //         }
        //     }
        //     let tooltip = '';
        //     let bandList = band && band.bands;
        //     if (bandList) {
        //         for (let i = 0; i < bandList.length; i ++) {
        //             let currentBand = bandList[i];
        //             if (currentBand.currentTime.duration.start <= currentX
        //                 && currentBand.currentTime.duration.end >= currentX) {
        //                 // Get information about the currently triggered band
        //                 tooltip = this.labelTooltip(currentBand, area.name);
        //                 break;
        //             }
        //         }
        //     }
        //     if (tooltip.length) {
        //         return tooltip;
        //     }
        //     else {
        //         return false;
        //     }
        // }
        // else {
        //     return false;
        // }
    }

    labelTooltip(currentBand, bandName) {
        let tooltip = '';
        let preStartTime = currentBand.preTime.start;
        let preEndTime = currentBand.preTime.end;
        let nextStartTime = currentBand.nextTime.start;
        let nextEndTime = currentBand.nextTime.end;
        let currentStartTime = currentBand.currentTime.duration.start;
        let currentEndTime = currentBand.currentTime.duration.end;
        tooltip += '<p class="label-opera label" '
            + 'data-current-start-time="'
            + currentStartTime
            + '" data-current-end-time="'
            + currentEndTime
            + '" data-band-name="' + bandName + '">Label</p>';
        // eg. 1/1
        let current = currentBand.bandNo;
        let total = currentBand.bandCount;
        if (current === total && current === 1) {
            tooltip += '<div class="num-tooltip">'
                + current + ' / ' + total
                + '</div>';
        }
        // eg. 1/6
        else if (current < total && current === 1) {
            tooltip += '<div class="num-tooltip">'
                + current + ' / ' + total
                + '<i class="load-trend right" data-action="right" data-next-start-time="' + nextStartTime + '" data-next-end-time="' + nextEndTime + '" data-band-name="' + bandName + '">></i></div>';
        }
        // eg. 6/6
        else if (current === total && current !== 1) {
            tooltip += '<div class="num-tooltip">'
                + '<i class="load-trend left" data-action="left" data-pre-start-time="' + preStartTime + '" data-pre-end-time="' + preEndTime + '" data-band-name="' + bandName + '"><</i></div>'
                + current + ' / ' + total
        }
        else {
            tooltip += '<div class="num-tooltip">'
                + '<i class="load-trend left" data-action="left" data-pre-start-time="' + preStartTime + '" data-pre-end-time="' + preEndTime + '" data-band-name="' + bandName + '"><</i>'
                + current + ' / ' + total
                + '<i class="load-trend right" data-action="right" data-next-start-time="' + nextStartTime + '" data-next-end-time="' + nextEndTime + '" data-band-name="' + bandName + '">></i></div>';
        }
        return tooltip;
    }

    getKeyboardOperaExtremes(newMax, newMin, currentMax, currentMin, extremesMax, extremesMin, operaType) {
        let startTime = newMin;
        let endTime = newMax;
        if (operaType === 'enlarge') {
            if (newMax < newMin) {
                startTime = newMax;
                endTime = newMin;
            }
        }
        else if (operaType === 'shrink') {
            if (newMin < extremesMin) {
                startTime = extremesMin;
            }
            if (newMax > extremesMax) {
                endTime = extremesMax;
            }
        }
        else if (operaType === 'left') {
            if (newMin <= extremesMin) {
                startTime = extremesMin;
                endTime = currentMax;
            }
        }
        else if (operaType === 'right') {
            if (newMax >= extremesMax) {
                startTime = currentMin;
                endTime = extremesMax;
            }
        }
        return {
            startTime,
            endTime
        };
    }

    afterSetExtremes(e) {
        e.preventDefault();
        this.selectedPoint = [];
        let type = e.trigger;
        let index;
        let max = Math.round(e.max);
        let min = Math.round(e.min);
        let rangeSelectorButton = this.state.options.rangeSelector.buttons;
        if (type === 'navigator' || type === 'rangeSelectorButton') {
            if (type === 'navigator') {
                index = this.getRangeSelectorButtonSelected(max - min, 'count');
            }
            else if (type === 'rangeSelectorButton') {
                index = this.getRangeSelectorButtonSelected(e.rangeSelectorButton.text, 'text');
            }
            this.setTrendData(this.props.dataName, min, max, index);
        }
    }

    getRangeSelectorButtonSelected(data, type) {
        let rangeSelectorButton = this.state.options.rangeSelector.buttons;
        let index;
        for (let i = 0; i < rangeSelectorButton.length; i ++) {
            if (rangeSelectorButton[i][type] === data) {
                index = i;
                break;
            }
        }
        return index;
    }

    getThumbDate(props) {
        let dataName = props.dataName || this.props.dataName;
        if (!dataName) {
            dataName = props.list[0].name;
            eventProxy.trigger('messageTip', {
                messageType: 'error',
                messageContent: 'No ' + dataName + ' data, just jump to the first data',
                messageShow: true,
                messageDuration: 2.5,
                messageCallback: function () {
                    let nextUrl = '/home/' + dataName;
                    hashHistory.push(nextUrl);
                }
            });
        }
        let url = api.getThumbTrend + dataName + '/thumb';
        axiosInstance.get(url).then(response => {
            const data = response.data;
            this.state.options.navigator.series.data = data.data.data;
            let extremesMax = data.data.data[data.data.data.length - 1][0];
            let extremesMin = data.data.data[0][0];
            let options = this.state.options;
            if ($('.container-skin').hasClass('skin-black')) {
                this.chartOptions.navigator.series.data = data.data.data;
                options = Object.assign({}, this.state.options, this.chartOptions);
            }
            this.setState({
                options,
                extremesMax,
                extremesMin
            });
        });
    }

    getTrendData(props) {
        let dataName = props.dataName || this.props.dataName;
        let list = props.list || this.props.list;
        let startTime;
        let endTime;
        if (!list.length) {
           return;
        }
        for (let item of list) {
            if (item.name === dataName) {
                startTime = item.display.start;
                endTime = item.display.end;
                break;
            }
        }
        this.setTrendData(dataName, startTime, endTime);
    }

    setTrendData(dataName, startTime, endTime, index, notShowTrendLoading) {
        const self = this;
        let url = api.getTrend
            + dataName
            + '/curves?'
            + 'startTime=' + startTime
            + '&endTime=' + endTime;
        if (this.chart) {
            this.chart.showLoading('Data is loading, please wait...');
        }
        axiosInstance.get(url).then(response => {
            const data = response.data;
            // Used to display tooltip
            let bands = data.data.bands;
            // Display collection of data
            let series = data.data.trends;
            series.forEach((item, index) => {
                if (item.type === 'line') {
                    this.optionLine(item, index);
                }
                else if (item.type === 'arearange') {
                    this.optionArearange(item);
                }
                else if (item.type === 'area') {
                    this.optionArea(item, index);
                }
                if (item.name === 'label line') {
                    this.getLabelSet(item);
                }
            });
            // Set the trend graph data
            this.state.options.series = series;
            // complex mode
            if (this.state.selectType === 'complex') {
                let baseLineData = [];
                let newSeries = [];
                let baseLineIndex = 0;
                let originBaseLineData = [];
                series.forEach((item, index) => {
                    // set base line
                    if (item.type === 'line' && item.name === 'base line') {
                        // double data
                        originBaseLineData = item.data;
                        item.data.forEach(data => {
                            baseLineData.push(data);
                            baseLineData.push(data);
                        });
                        item.data = baseLineData;
                        baseLineIndex = index;
                    }
                    else if (item.type === 'line' && item.name === 'label line') {
                        let zones = [];
                        let labelSet = this.getLabelSet(item);
                        labelSet.forEach(set => {
                            if (set[0] === set[1]) {
                                // for better show label line
                                originBaseLineData.forEach((data, dataIndex) => {
                                    if (data[0] === set[0]) {
                                        if (dataIndex + 1 < originBaseLineData.length) {
                                            set[1] = originBaseLineData[dataIndex + 1][0];
                                        }
                                    }
                                });
                            }
                            zones.push({
                                value: set[0],
                                color: '#7cb5ec'
                            });
                            zones.push({
                                value: set[1],
                                color: '#ff0000'
                            });
                        });
                        zones.push({
                            color: '#7cb5ec'
                        });
                        item.data = originBaseLineData;
                        item.zones = zones;
                    }
                    newSeries.push(item);
                });
                this.state.options.series = newSeries;
            }
            // Set the width of the trend graph
            let chartWidth = this.getTrendWidth();
            this.state.options.chart.width = chartWidth;
            // Calculate whether the shortcut time period is selected
            this.state.options.rangeSelector.selected = this.getShortCutItem(startTime, endTime, index);
            // Set the maximum and minimum y axis
            this.state.options.yAxis = Object.assign(this.state.options.yAxis, {
                min: data.data.yAxis[0],
                max: data.data.yAxis[1]
            });
            this.state.options.xAxis = Object.assign(this.state.options.xAxis, {
                min: startTime,
                max: endTime
            });
            let options = this.state.options;
            if ($('.container-skin').hasClass('skin-black')) {
                this.chartOptions.xAxis.max = endTime;
                this.chartOptions.xAxis.min = startTime;
                this.chartOptions.yAxis.max = data.data.yAxis[1];
                this.chartOptions.yAxis.min = data.data.yAxis[0];
                options = Object.assign({}, this.state.options, this.chartOptions);
            }
            this.setState({
                loading: false,
                options,
                bands
            }, () => {
                // // set this.selectedPoint
                // if (!this.selectedPoint.length) {
                //     let labelLineIndex = 0;
                //     let baseLineIndex = 0;
                //     let chart = this.chart;
                //     chart.series.forEach((item, index) => {
                //         if (item.type === 'line' && item.name === 'label line') {
                //             labelLineIndex =  index;
                //         }
                //         if (item.type === 'line' && item.name === 'base line') {
                //             baseLineIndex = index;
                //         }
                //     });
                //     let baseLineData = this.chart.series[baseLineIndex].data;
                //     let currentSelectedPoints = [];
                //     let selectedPoint = [];
                //     this.labelSet.forEach(item => {
                //         selectedPoint = [];
                //         baseLineData.forEach(data => {
                //             if (data.x >= item[0] && data.x <= item[1]) {
                //                 selectedPoint.push(data);
                //             }
                //         });
                //         currentSelectedPoints = this.filterSelectedPoints(selectedPoint);
                //         this.selectedPoint = this.selectedPoint.concat([...currentSelectedPoints]);
                //     });
                //     console.log(this.selectedPoint)
                // }
            });
            if (!notShowTrendLoading) {
                this.props.hideLoading();
            }
            if (this.chart) {
                this.chart.hideLoading();
            }
        });
    }

    getLabelSet(data) {
        this.tempSelectedPoint = [];
        let labelSet = [];
        let labelItem = [];
        let series = data.data;
        for (let i = 0; i < series.length; i ++) {
            let currentX = series[i][0];
            let currentY = series[i][1];
            if (i > 0 && i < series.length - 1) {
                if (currentY !== null && series[i - 1][1] === null) {
                    labelItem.push(currentX);
                }
                if (currentY !== null && series[i + 1][1] === null) {
                    labelItem.push(currentX);
                    labelSet.push(labelItem);
                    labelItem = [];
                }
            }
            else {
                if (i === 0) {
                    if (currentY !== null) {
                        labelItem.push(currentX);
                    }
                }
                else if (i === series.length - 1) {
                    if (currentY !== null) {
                        labelItem.push(currentX);
                    }
                }
            }
        }
        this.labelSet = labelSet;
        console.log(labelSet)
        return labelSet;
    }

    getShortCutItem(startTime, endTime, index) {
        if (index) {
            return index;
        }
        else {
            return this.getRangeSelectorButtonSelected(endTime - startTime, 'count');
        }
    }

    getTrendWidth(bandMenuFold) {
        if ($('.container-skin').hasClass('skin-black')) {
            let width = document.body.clientWidth;
            if (this.props.foldMenu) {
                width = document.body.clientWidth - 30;
            }
            else {
                width = document.body.clientWidth - 200 - 30;
            }
            return width - 25;
        }
        else {
            let width = document.body.clientWidth;
            // Four situations
            // 1.Left to the right
            if (this.props.foldMenu && bandMenuFold) {
                width = document.body.clientWidth - 40;
            }
            // 2.Left to the right
            else if (this.props.foldMenu && !bandMenuFold){
                // 200 is the width of the sidebar, 150 is the width of the legend
                width = document.body.clientWidth - 150;
            }
            // 3.Left and right
            else if (!this.props.foldMenu && bandMenuFold) {
                width = document.body.clientWidth - 200 - 40;
            }
            // 4.Left exhibition right exhibition
            else {
                width = document.body.clientWidth - 200 - 150;
            }
            return width - 25;
        }
    }

    optionLine(item, index) {
        item.showInLegend = false;
        item.lineWidth = 2;
        item.zIndex = 2;
        item.enableMouseTracking = true;
        item.dataGrouping = {
            enabled: false
        };
        if (item.name === 'base line') {
            item.zIndex = 4;
            item.color = '#7cb5ec';
            if ($('.container-skin').hasClass('skin-black')) {
                item.zIndex = 99;
                item.lineWidth = 3;
                item.color = '#00fe88';
                item.dataGrouping = {
                    enabled: false
                };
                this.baseLine = item.data;
            }
        }
        else if (item.name === 'label line') {
            item.zIndex = 5;
            item.color = '#ff0000';
            item.zoneAxis = 'x';
            if ($('.container-skin').hasClass('skin-black')) {
                item.showInLegend = false;
                item.lineWidth = 3;
                item.zIndex = 100;
                item.enableMouseTracking = true;
                item.dataGrouping = {
                    enabled: false
                };
                item.color = '#ff0000';
            }
        }
        else {
            let colors = this.state.options.colors;
            item.color = colors[index % colors.length];
        }
    }

    optionArearange(item) {
        item.lineWidth = 0;
        item.color = 'rgb(222, 247, 222)';
        item.zIndex = 0;
        item.enableMouseTracking = false;
        item.showInLegend = true;
        item.dataGrouping = {
            enabled: false
        };
        if ($('.container-skin').hasClass('skin-black')) {
            item.lineWidth = 0;
            item.color = 'rgba(255,255,255,0.15)';
            // item.fillColor = 'red';
            // item.fillOpacity = 'red';
            item.zIndex = 0;
            item.enableMouseTracking = false;
            item.showInLegend = false;
            item.dataGrouping = {
                enabled: false
            };
        }
    }

    optionArea(item, index) {
        item.lineWidth = 0;
        item.fillOpacity = 0.3;
        item.zIndex = 0;
        item.enableMouseTracking = true;
        item.dataGrouping = {
            enabled: false
        };
        let colors = this.state.options.colors;
        item.color = colors[index % colors.length];
        let legend = cookie.load('bandStatus') && cookie.load('bandStatus')[this.props.dataName];
        if (legend) {
            if (legend[item.name] === 'show') {
                item.visible = true;
            }
            else {
                item.visible = false;
            }
        }
        else {
            item.visible = true;
        }
    }

    renderSummary() {
        let dataName = this.props.dataName;
        let period;
        let length;
        let labelRatio;
        for (let item of this.props.list) {
            if (item.name === dataName) {
                period = moment(item.time.start).format(dateFormat) + ' ~ ' + moment(item.time.end).format(dateFormat);
                length = item.period.length;
                labelRatio = item.labelRatio;
                break;
            }
        }
        return (
            <p>
                <span className="title">{dataName}</span>
                <span className="brief">
                    <i>{period}</i>
                    <i>Interval: {length}</i>
                    <i>Anomaly percent: {labelRatio}</i>
                </span>
            </p>
        );
    }

    returnChart(chart) {
        this.chart = chart;
        this.refs.band.initBand(chart);
        // set this.selectedPoint
        // let labelLineIndex = 0;
        // let baseLineIndex = 0;
        // chart.series.forEach((item, index) => {
        //     if (item.type === 'line' && item.name === 'label line') {
        //         labelLineIndex =  index;
        //     }
        //     if (item.type === 'line' && item.name === 'base line') {
        //         baseLineIndex = index;
        //     }
        // });
        // let selectedPoints = [];
        // this.tempSelectedPoint.forEach(item => {
        //     selectedPoints.push(item[0]);
        // });
        // this.selectedPoint = [];
        // let baseLineData = this.chart.series[baseLineIndex].data;
        // baseLineData.forEach(item => {
        //     if (selectedPoints.indexOf(item.x) !== -1) {
        //         this.selectedPoint.push(item);
        //     }
        // });
        // console.log(this.selectedPoint)
        // let currentSelectedPoints = [];
        // let selectedPoint = [];
        // this.labelSet.forEach(item => {
        //     selectedPoint = [];
        //     baseLineData.forEach(data => {
        //         if (data.x >= item[0] && data.x <= item[1]) {
        //             selectedPoint.push(data);
        //         }
        //     });
        //     currentSelectedPoints = this.filterSelectedPoints(selectedPoint);
        //     this.selectedPoint = this.selectedPoint.concat([...currentSelectedPoints]);
        // });
        // console.log(this.selectedPoint)
    }

    redrawTrend(foldMenu) {
        let trendWidth = this.getTrendWidth(foldMenu);
        var proto = Object.getPrototypeOf(this.state.options);
        let options = Object.assign({},Object.create(proto), {
            chart: {
                width: trendWidth
            }
        });
        this.chart.update(options);
    }

    render() {
        if (this.state.loading) {
            return (
                <div className="loading-trend" ref="loadingContainer">The trend is loading, please wait</div>
            );
        }
        else {
            if (this.props.list.length) {
                let trendWidth = document.body.clientWidth - 200 - 20 + 'px';
                let trendLeft = 200;
                if (this.props.foldMenu) {
                    trendLeft = 0;
                    trendWidth = document.body.clientWidth - 20 + 'px';
                }
                return (
                    <div className="trend" style={{
                        width: trendWidth,
                        left: trendLeft + 'px'
                    }} ref="trendContainer">
                        <h3 className="summary">
                            {this.renderSummary()}
                        </h3>
                        <Band series={this.state.options.series}
                              dataName={this.props.dataName}
                              redrawTrend={foldMenu => this.redrawTrend(foldMenu)}
                              list={this.props.list}
                              // chart={this.chart}
                              ref="band"
                        ></Band>
                        <Chart ref="container"
                               config={this.state.options}
                               returnChart={chart => this.returnChart(chart)}
                               type="stockChart"
                        ></Chart>
                    </div>
                );
            }
            else {
                let trendWidth = document.body.clientWidth - 200 - 20 + 'px';
                let trendLeft = 200;
                if (this.props.foldMenu) {
                    trendLeft = 0;
                    trendWidth = document.body.clientWidth - 20 + 'px';
                }
                return (
                    <div className="trend no-data-list" style={{
                        width: trendWidth,
                        left: trendLeft + 'px'
                    }}
                    >
                        <img src={img} alt="no data" className="no-data-list-img"/>
                        <div className="no-data-list-tip">There is no data, yet</div>
                        <UploadData type="trend"></UploadData>
                    </div>
                );
            }
        }
    }
}

