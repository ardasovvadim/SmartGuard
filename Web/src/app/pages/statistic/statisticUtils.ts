export class StatisticUtils {
  static loadExternalScript(scriptUrl: string) {
    const scriptElement = document.createElement('script');
    scriptElement.src = scriptUrl;
    window.document.body.appendChild(scriptElement);
  }

  static loadExternalStyles(styleUrl: string) {
    const styleElement = document.createElement('link');

    styleElement.href = styleUrl;
    styleElement.id = styleUrl.split('.')[0];
    styleElement.rel = 'stylesheet';

    document.head.appendChild(styleElement);
  }
}
