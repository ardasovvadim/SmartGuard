import { Injectable } from '@angular/core';
import {JoinData, StatisticData} from './data.model';

@Injectable({
  providedIn: 'root'
})
export class DataStoreService {

  private data: JoinData = null;

  constructor() { }

  storeJoinData(data: JoinData) {
    this.data = data;
  }

  getJoinData() {
    return this.data;
  }

  isJoinData() {
    return this.data != null;
  }

  getSessionIdFromQuery() {
    return this.getParameterByName('sessionId');
  }

  private getParameterByName(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    const regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
  }

  storeJoinDataBySessionId(sessionId: string, joinData: JoinData) {
    localStorage.setItem(sessionId, JSON.stringify(joinData));
  }

  getJoinDataBySessionId(sessionId: string) {
    const data = localStorage.getItem(sessionId);
    return data != null ? JSON.parse(data) as JoinData : null;
  }

  createStatisticData(joinData: JoinData, sessionId: string): StatisticData {
    const data = joinData as StatisticData;
    data.sessionId = sessionId;
    data.faceDetectionResults = [];
    data.statisticData = [];
    data.verificationData = [];
    data.alerts = [];

    return data;
  }

  saveStatisticData(data: StatisticData) {
    localStorage.setItem('statisticData', JSON.stringify(data));
  }

  getStatistic() {
    return JSON.parse(localStorage.getItem('statisticData')) as StatisticData;
  }

  getStatisticData(joinData: JoinData, sessionId: string, sessionRestored: boolean): StatisticData {
    const data = localStorage.getItem('statisticData');

    if (data != null && sessionRestored) {
      return JSON.parse(data) as StatisticData;
    }

    return this.createStatisticData(joinData, sessionId);
  }
}
