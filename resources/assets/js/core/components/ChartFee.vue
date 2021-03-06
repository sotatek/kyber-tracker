<template>
  <div>
    <canvas :id="elementId" height="250px" class="mt-20"></canvas>
  </div>
</template>

<script>

  import _ from 'lodash';
  import moment from 'moment';
  import BigNumber from 'bignumber.js';
  import AppRequest from '../request/AppRequest';
  import util from '../helper/util';
  import network from '../../../../../config/network';

  export default {
    props: {
      elementId: {
        type: String,
      },
    },
    data() {
      return {
        chartInstance: undefined
      };
    },
    methods: {
      _buildChartData(feeData, interval) {
        const labels = [];
        const counts = [];
        const dataset = [];

        if (interval === 'H1') {
          const keyedVolumeData = _.keyBy(feeData, 'hourSeq');
          for (let seq = feeData[0].hourSeq; seq <= feeData[feeData.length - 1].hourSeq; seq++) {
            labels.push(seq * 3600 * 1000);
            const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
            dataset.push(Math.round(volume * 100) / 100);
            counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
          }
        } else if (interval === 'D1') {
          const keyedVolumeData = _.keyBy(feeData, 'daySeq');
          for (let seq = feeData[0].daySeq; seq <= feeData[feeData.length - 1].daySeq; seq++) {
            labels.push(seq * 3600 * 24 * 1000);
            const volume = (keyedVolumeData[seq] ? keyedVolumeData[seq].sum : 0);
            dataset.push(Math.round(volume * 100) / 100);
            counts.push(keyedVolumeData[seq] ? keyedVolumeData[seq].count : 0)
          }
        }

        return {
          labels,
          counts,
          datasets: [{
            data: dataset,
            pointRadius: 0,
            backgroundColor: 'rgb(148, 190, 190)',
            borderColor: 'rgb(148, 190, 190)',
            showLine: true,
            spanGaps: true,
          }]
        };
      },
      refresh(period, interval) {
        AppRequest.getFeeToBurn(period, interval, (err, feeData) => {
          const ctx = document.getElementById(this.elementId);
          const data = this._buildChartData(feeData, interval);
          const options = this._getChartOptions(interval);

          if (this.chartInstance) {
            this.chartInstance.destroy();
            this.chartInstance = undefined;
          }

          this.chartInstance = new Chart(ctx, {
            type: 'LineWithLine',
            data: data,
            options: options,
          });
        });
      },
      _getChartOptions(interval) {
        const callbacks = {
          title: (tooltipItem, data) => {
            const index = tooltipItem[0].index;
            const value = data.labels[index];
            const d = moment(value);
            if (interval === 'H1') {
              return util.getLocale() === 'vi' ? d.format('DD/MM HH:mm') : d.format('MMM DD HH:mm');
            } else {
              return util.getLocale() === 'vi' ? d.format('DD/MM') : d.format('MMM DD');
            }
          },
          label: () => {
          },
          afterBody: (tooltipItem, data) => {
            const index = tooltipItem[0].index;
            const label = this.$t('chart.label.to_burn') + ': ' + util.numberWithCommas(data.datasets[0].data[index])
              + ' KNC';
            return [label];
          }
        };

        const yAxeScale = {
          ticks: {
            maxRotation: 0,
            callback: (label, index, labels) => {
              return util.numberWithCommas(label) + ' KNC';
            }
          },
          maxTicksLimit: 5
        };

        const xAxeScale = {
          ticks: {
            maxRotation: 0,
            callback: (label, index, labels) => {
              const d = moment(label);
              if (util.getLocale() === 'vi') {
                return d.format('DD/MM');
              } else {
                return d.format('MMM DD');
              }
            },
            maxTicksLimit: 5
          }
        };

        return {
          tooltips: {
            mode: 'index',
            axis: 'x',
            intersect: false,
            backgroundColor: 'rgba(25, 46, 59, 0.7)',
            callbacks,
          },
          scales: {
            yAxes: [yAxeScale],
            xAxes: [xAxeScale],
          },
          legend: {
            display: false
          },
          maintainAspectRatio: false,
        };
      },
    },
  };
</script>
