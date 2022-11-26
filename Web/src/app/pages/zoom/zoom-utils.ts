import {ZoomMtg} from '@zoomus/websdk';
import {defer} from 'rxjs';
import {AlertColor, SgAttendee} from './services/zoom.model';

export interface VideoContainer {
  container: HTMLDivElement;
  label: string;
}

export interface UiMeasureData {
  userName: string;
  width: number;
  height: number;
  x: number;
  y: number;
}

export class SgZoomUtils {
  static removeAllFaceRectangles() {
    const rectangles = Array.from(document.getElementsByClassName('sg-rectangle') as HTMLCollectionOf<HTMLDivElement>);
    for (let element of rectangles) {
      element.remove();
    }
  }

  static createFaceRectangle(container: HTMLDivElement): HTMLDivElement {
    const rectangle = document.createElement('div');
    rectangle.classList.add('sg-rectangle');
    container.appendChild(rectangle);

    return rectangle;
  }

  static getFaceRectangles(container: HTMLDivElement) {
    return Array.from(container.getElementsByClassName('sg-rectangle') as HTMLCollectionOf<HTMLDivElement>);
  }

  static getMeasures() {
    const canvas = document.getElementById('speak-view-video') as HTMLCanvasElement;
    const canvasOffset = canvas.getBoundingClientRect();
    const containersArr = this.getVideoContainersData();

    return containersArr.map(element => {
      const userName = element.label;
      const childMeasures = element.container.getBoundingClientRect();
      return {
        userName: userName,
        x: childMeasures.x - canvasOffset.x,
        y: childMeasures.y - canvasOffset.y,
        width: childMeasures.width,
        height: childMeasures.height
      } as UiMeasureData;
    });
  }

  static loadExternalStyles(styleUrl: string) {
    const styleElement = document.createElement('link');

    styleElement.href = styleUrl;
    styleElement.id = styleUrl.split('.')[0];
    styleElement.rel = 'stylesheet';

    document.head.appendChild(styleElement);
  }

  static loadExternalScript(scriptUrl: string) {
    const scriptElement = document.createElement('script');
    scriptElement.src = scriptUrl;
    window.document.body.appendChild(scriptElement);
  }

  static initializeZoomSdk() {
    this.loadExternalStyles('zoom-react-select.css');
    // loadExternalStyles('zoom-bootstrap.css');

    ZoomMtg.setZoomJSLib('https://source.zoom.us/2.9.0/lib', '/av');
    ZoomMtg.preLoadWasm();
    ZoomMtg.prepareWebSDK();
    ZoomMtg.i18n.load('en-US');
    ZoomMtg.i18n.reload('en-US');
  }

  static toggleGalleryView() {
    const text = 'Gallery View';
    // @ts-ignore
    const galleryViewEl = document.evaluate(`//a[text()='${text}']`, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as HTMLAnchorElement;
    if (galleryViewEl) {
      galleryViewEl.click();
    }
  }

  static getFrame() {
    const canvasId = 'speak-view-video';
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    return canvas.toDataURL("image/jpg", 1.0).split(';base64,')[1];
  }

  static startMeeting(
    leaveUrl: string,
    signature: string,
    meetingNumber: string,
    userName: string,
    sdkKey: string,
    userEmail: string,
    passWord: string,
    onJoinSuccess: () => void,
    onError: (error: any) => void
  ) {
    // @ts-ignore
    document.getElementById('zmmtg-root').style.display = 'block';

    ZoomMtg.init({
      leaveUrl: leaveUrl,
      enableHD: true,
      success: () => {
        ZoomMtg.join({
          signature: signature,
          meetingNumber: meetingNumber,
          userName: userName,
          sdkKey: sdkKey,
          userEmail: userEmail,
          passWord: passWord,
          success: onJoinSuccess,
          error: onError
        })
      },
      error: (error: any) => {
        console.log(error)
      }
    })
  }

  static getAttendeesData() {
    return defer(() => new Promise((resolve, reject) => {
      ZoomMtg.getAttendeeslist({
        success: (res: any) => {
          resolve(res);
        },
        error: (error: any) => {
          reject(error);
        }
      })
    }));
  }

  static getVideoContainersData() {
    const containers = Array.from(document.getElementsByClassName('gallery-video-container__video-frame') as HTMLCollectionOf<HTMLDivElement>);
    return containers.map(container => {
      return {
        container,
        label: this.getAttendeeUserNameByContainer(container)
      } as VideoContainer;
    });
  }

  static getVideoContainersDataByAttendees(attendees: SgAttendee[]) {
    const containers = this.getVideoContainersData();
    return containers.filter(container => attendees.some(a => a.userName == container.label));
  }


  static getSpanNameElement(container: HTMLDivElement) {
    return container.getElementsByTagName('span')[0];
  }

  static getAttendeeUserNameByContainer(container: HTMLDivElement) {
    const spam = this.getSpanNameElement(container);
    return spam.innerText;
  }

  static markContainer(container: VideoContainer, color: AlertColor) {
    if (color == AlertColor.None) {
      container.container.style.border = 'none';
      return;
    }

    const colorHex = this.alertColorToHex(color);
    container.container.style.border = `3px solid ${colorHex}`;
  }

  static markContainers(containers: VideoContainer[], color: AlertColor) {
    const colorHex = this.alertColorToHex(color);

    for (let container of containers) {
      if (color == AlertColor.None) {
        container.container.style.border = null;
        continue;
      }

      container.container.style.border = '3px solid ' + colorHex;
    }
  }

  static alertColorToHex(color: AlertColor) {
    let colorHex = '';
    switch (color) {
      case AlertColor.Red:
        colorHex = '#ff0000';
        break;
      case AlertColor.Yellow:
        colorHex = '#ffff00';
        break;
      case AlertColor.Green:
        colorHex = '#00ff00';
        break;
      case AlertColor.Grey:
        colorHex = '#808080';
        break;
      default:
        colorHex = null;
    }

    return colorHex;
  }
}
