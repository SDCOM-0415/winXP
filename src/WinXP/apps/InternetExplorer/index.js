import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import styled from 'styled-components';

import { WindowDropDowns } from 'components';
import dropDownData from './dropDownData';
import ie from 'assets/windowsIcons/svg/Internet Explorer 6.svg';
import printer from 'assets/windowsIcons/svg/Printer.svg';
import go from 'assets/windowsIcons/svg/Go.svg';
import links from 'assets/windowsIcons/links.png';
import search from 'assets/windowsIcons/svg/Search.svg';
import favorite from 'assets/windowsIcons/svg/Favorites.svg';
import back from 'assets/windowsIcons/back.png';
import earth from 'assets/windowsIcons/earth.png';
import edit from 'assets/windowsIcons/svg/IE Edit.svg';
import forward from 'assets/windowsIcons/forward.png';
import history from 'assets/windowsIcons/svg/IE History.svg';
import home from 'assets/windowsIcons/svg/IE Home.svg';
import mail from 'assets/windowsIcons/svg/Email.svg';
import msn from 'assets/windowsIcons/svg/MSN.svg';
import refresh from 'assets/windowsIcons/svg/IE Refresh.svg';
import stop from 'assets/windowsIcons/svg/IE Stop.svg';
import windows from 'assets/windowsIcons/windows.png';
import dropdown from 'assets/windowsIcons/dropdown.png';

const HOME_URL = 'https://search.sdcom.asia/';
const SEARCH_URL = 'https://search.sdcom.asia/?q=';
const LOAD_TIMEOUT = 12000;

function toRequestUrl(input) {
  var url = input.trim();
  if (!url) return HOME_URL;
  if (url === HOME_URL || url === HOME_URL.slice(0, -1)) {
    return HOME_URL;
  }
  if (/^https?:\/\//i.test(url)) return url;
  if (/^[\w-]+(\.[\w-]+)+/.test(url)) return 'https://' + url;
  return SEARCH_URL + encodeURIComponent(url);
}

function toDisplayUrl(requestUrl) {
  if (!requestUrl) return HOME_URL;
  if (requestUrl === HOME_URL.slice(0, -1)) {
    return HOME_URL;
  }
  return requestUrl;
}

function createHistoryEntry(input) {
  var requestUrl = toRequestUrl(input);
  return {
    requestUrl,
    displayUrl: toDisplayUrl(requestUrl),
  };
}

function getReadableHost(url) {
  try {
    return new URL(url).hostname;
  } catch (e) {
    return toDisplayUrl(url);
  }
}

function getErrorPageHtml(url, errorType) {
  var displayUrl = toDisplayUrl(url);
  var footerText = '找不到服务器或 DNS 错误';
  var description =
    '您正在查找的页当前不可用。网站可能遇到支持问题，或者您需要调整您的浏览器设置。';
  var highlightText =
    '要试图修复网络连接问题，请单击 <b>工具</b>，然后单击 <b>“诊断连接问题...”</b>';

  if (errorType === 'refused') {
    footerText = '网站拒绝显示该网页';
    description =
      '您正在尝试访问的网站拒绝在当前窗口中显示该页面。该站点可能禁止被嵌入或拒绝连接。';
    highlightText =
      '此网站可能阻止了页面在浏览器窗口内加载。您可以尝试打开其他链接，或返回上一页。';
  } else if (errorType === 'timeout') {
    footerText = '连接超时';
    description =
      '服务器响应时间过长，Internet Explorer 无法在限定时间内完成该网页的加载。';
    highlightText =
      '请检查网络连接是否稳定，或稍后重试。如果问题持续存在，网站服务器可能暂时不可用。';
  } else if (errorType === 'blocked') {
    footerText = '内容被阻止或不可显示';
    description =
      '当前网页内容无法在此浏览器环境中显示，可能受到浏览器安全策略、站点限制或内容类型影响。';
    highlightText =
      '您可以尝试访问该网站的其他页面，或返回上一页后重新输入地址。';
  }

  return `<style>
  .xp-error { margin:0; background:#fff; color:#000; font-family:'宋体',SimSun,serif; font-size:12px; line-height:1.5; }
  .xp-error .page { padding:22px 28px 40px; }
  .xp-error .address { margin-bottom:16px; color:#000; font-size:12px; }
  .xp-error .heading { display:flex; align-items:flex-start; gap:14px; margin-bottom:18px; }
  .xp-error .heading-icon { width:26px; height:42px; border:1px solid #666; position:relative; flex-shrink:0; }
  .xp-error .heading-icon:before { content:'i'; position:absolute; left:8px; top:2px; font-size:32px; font-weight:bold; color:#204aaf; font-family:Times New Roman,serif; }
  .xp-error h1 { margin:2px 0 0; font-size:22px; font-weight:normal; }
  .xp-error .desc { font-size:12px; margin:0 0 20px 40px; line-height:1.6; }
  .xp-error .highlight { margin:0 0 22px 0; border:3px solid #ff0000; padding:12px 16px; max-width:580px; display:flex; align-items:center; gap:14px; }
  .xp-error .highlight-icon { width:60px; height:60px; flex-shrink:0; position:relative; }
  .xp-error .highlight-icon:before { content:'🌐'; position:absolute; left:0; top:2px; font-size:40px; }
  .xp-error .highlight-icon:after { content:'?'; position:absolute; right:2px; bottom:0; width:24px; height:24px; border-radius:50%; background:#f00; color:#fff; font-size:18px; line-height:24px; text-align:center; font-weight:bold; }
  .xp-error .highlight-text { font-size:12px; font-weight:bold; line-height:1.6; }
  .xp-error .subheading { margin:22px 0 6px; font-size:12px; font-weight:bold; }
  .xp-error ul { margin:6px 0 0 18px; padding-left:18px; }
  .xp-error li { margin:8px 0; font-size:12px; line-height:1.6; list-style-type:disc; }
  .xp-error ol { margin:6px 0 0 0; padding-left:24px; }
  .xp-error ol li { list-style-type:decimal; }
  .xp-error .footer { margin-top:36px; font-size:12px; line-height:1.6; }
  .xp-error .footer small { display:block; margin-top:4px; }
  .xp-error b { font-weight:bold; }
  .xp-error u { text-decoration:underline; text-decoration-color:#f00; text-decoration-thickness:2px; }
  </style>
  <div class="xp-error">
    <div class="page">
      <div class="address">${displayUrl}</div>
      <div class="heading">
        <div class="heading-icon"></div>
        <h1>无法显示网页</h1>
      </div>
      <div class="desc">
        ${description}
      </div>
      <div class="highlight">
        <div class="highlight-icon"></div>
        <div class="highlight-text">
          ${highlightText}
        </div>
      </div>
      <div class="subheading">其他选项：</div>
      <ul>
        <li>单击 <b>刷新</b> 按钮，或稍后重试。</li>
        <li>如果您已经在地址栏中输入该网页的地址，请确认其拼写正确。</li>
        <li>要检查您的网络连接，请单击工具菜单，然后单击 <b>Internet 选项</b>。在连接选项卡上，单击 <b>设置</b>。设置必须与您的局域网 (LAN) 管理员或 Internet 服务供应商 (ISP) 提供的一致。</li>
        <li>查看您的 Internet 连接设置是否正确被检测。您可能设置让 Microsoft Windows 检查您的网站并自动发现网络连接设置 (如果您的网络管理员已经启用此设置)。
          <ol>
            <li>单击工具菜单，然后单击 <b>Internet 选项</b>。</li>
            <li>在连接选项卡上，单击 <b>LAN 设置</b>。</li>
            <li>选择自动检测设置，然后单击 <b>确定</b>。</li>
          </ol>
        </li>
        <li>某些站点要求 128 位连接安全。单击帮助菜单，然后单击关于 <b>Internet Explorer</b> 可以查看您所安装的安全强度。</li>
        <li>如果您要访问某安全站点，请确保您的安全设置能够支持。请单击工具菜单，然后单击 <b>Internet 选项</b>。在"高级"选项卡上，滚动到"安全"部分，复选 SSL 2.0、SSL 3.0、TLS 1.0、PCT 1.0 设置。</li>
        <li>单击 <u>上一步</u> 按钮，尝试其他链接。</li>
      </ul>
      <div class="footer">
        ${footerText}
        <small>Internet Explorer</small>
      </div>
    </div>
  </div>`;
}

function getStatusText(loading, url, errorType) {
  if (loading) return `正在打开 ${toDisplayUrl(url)}`;
  if (errorType === 'refused') return `${getReadableHost(url)} 拒绝连接`;
  if (errorType === 'timeout') return `连接 ${getReadableHost(url)} 超时`;
  if (errorType === 'blocked') return `${getReadableHost(url)} 无法在此处显示`;
  if (errorType) return `无法访问 ${getReadableHost(url)}`;
  if (url === HOME_URL) return '完成';
  try {
    return `已打开 ${new URL(url).hostname}`;
  } catch (e) {
    return '完成';
  }
}

function InternetExplorer({ onClose, openUrl }) {
  const iframeRef = useRef(null);
  const addressBarRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const initialEntry = createHistoryEntry(openUrl || HOME_URL);
  const [url, setUrl] = useState(initialEntry.requestUrl);
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState('');
  const [inputValue, setInputValue] = useState(initialEntry.displayUrl);
  const [historyStack, setHistoryStack] = useState([initialEntry]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [showAddressHistory, setShowAddressHistory] = useState(false);
  const [addressInputFocused, setAddressInputFocused] = useState(false);

  const historyOptions = useMemo(() => {
    const options = [];
    historyStack.forEach(entry => {
      if (!options.includes(entry.displayUrl)) {
        options.push(entry.displayUrl);
      }
    });
    return options.reverse();
  }, [historyStack]);

  const navigate = useCallback(
    newUrl => {
      const entry = createHistoryEntry(newUrl);
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      setUrl(entry.requestUrl);
      setInputValue(entry.displayUrl);
      setLoading(true);
      setErrorType('');
      setShowAddressHistory(false);
      setHistoryStack(prev => {
        const newStack = prev.slice(0, historyIndex + 1);
        newStack.push(entry);
        return newStack;
      });
      setHistoryIndex(prev => prev + 1);
    },
    [historyIndex],
  );

  useEffect(() => {
    if (openUrl && toRequestUrl(openUrl) !== url) {
      navigate(openUrl);
    }
  }, [openUrl, url, navigate]);

  useEffect(() => {
    if (!loading) {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      return;
    }

    loadTimeoutRef.current = setTimeout(() => {
      setLoading(false);
      setErrorType('timeout');
    }, LOAD_TIMEOUT);

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [loading, url]);

  useEffect(() => {
    function onDocumentMouseDown(e) {
      if (addressBarRef.current && !addressBarRef.current.contains(e.target)) {
        setShowAddressHistory(false);
        setAddressInputFocused(false);
      }
    }
    document.addEventListener('mousedown', onDocumentMouseDown);
    return () => document.removeEventListener('mousedown', onDocumentMouseDown);
  }, []);

  function goBack() {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const targetEntry = historyStack[newIndex];
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      setUrl(targetEntry.requestUrl);
      setInputValue(targetEntry.displayUrl);
      setLoading(true);
      setErrorType('');
    }
  }

  function goForward() {
    if (historyIndex < historyStack.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const targetEntry = historyStack[newIndex];
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
      setUrl(targetEntry.requestUrl);
      setInputValue(targetEntry.displayUrl);
      setLoading(true);
      setErrorType('');
    }
  }

  function goHome() {
    navigate(HOME_URL);
  }

  function onStop() {
    if (!loading) return;
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setLoading(false);
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.stop();
    }
  }

  function onRefresh() {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setLoading(true);
    setErrorType('');
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  }

  function onGo() {
    navigate(inputValue);
  }

  function onSelectHistoryUrl(historyUrl) {
    navigate(historyUrl);
  }

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      navigate(inputValue);
    } else if (e.key === 'ArrowDown') {
      setShowAddressHistory(true);
    } else if (e.key === 'Escape') {
      setShowAddressHistory(false);
      setInputValue(toDisplayUrl(url));
    }
  }

  function onIframeLoad() {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setLoading(false);
    try {
      var iframeWindow = iframeRef.current && iframeRef.current.contentWindow;
      var iframeDocument = iframeWindow && iframeWindow.document;
      var iframeSrc = iframeWindow && iframeWindow.location.href;
      var iframeTitle = (iframeDocument && iframeDocument.title) || '';
      var iframeBodyText =
        (iframeDocument &&
          iframeDocument.body &&
          iframeDocument.body.innerText) ||
        '';
      var normalizedTitle = iframeTitle.toLowerCase();
      var normalizedBodyText = iframeBodyText.toLowerCase();
      var nextErrorType = '';

      if (iframeSrc && /^https?:\/\//i.test(iframeSrc) && iframeSrc !== url) {
        setUrl(iframeSrc);
        setInputValue(toDisplayUrl(iframeSrc));
        setHistoryStack(prev => {
          const newStack = prev.slice();
          const currentEntry = {
            requestUrl: iframeSrc,
            displayUrl: toDisplayUrl(iframeSrc),
          };
          newStack[historyIndex] = currentEntry;
          return newStack;
        });
      }

      if (iframeSrc && /^chrome-error:\/\//i.test(iframeSrc)) {
        nextErrorType = 'dns';
      } else if (
        normalizedTitle === '无法访问此网站' ||
        normalizedTitle === 'this site can’t be reached' ||
        normalizedTitle === "this site can't be reached" ||
        normalizedBodyText.includes('err_name_not_resolved') ||
        normalizedBodyText.includes('dns_probe_finished') ||
        normalizedBodyText.includes('server dns address could not be found') ||
        normalizedBodyText.includes('无法访问此网站') ||
        normalizedBodyText.includes('找不到服务器')
      ) {
        nextErrorType = 'dns';
      } else if (
        normalizedBodyText.includes('refused to connect') ||
        normalizedBodyText.includes('拒绝连接') ||
        normalizedBodyText.includes('refused this connection') ||
        normalizedBodyText.includes('已拒绝连接')
      ) {
        nextErrorType = 'refused';
      } else if (
        normalizedBodyText.includes('err_connection_refused') ||
        normalizedBodyText.includes('err_blocked_by_response') ||
        normalizedBodyText.includes('err_failed') ||
        normalizedBodyText.includes('无法在此网页中显示') ||
        normalizedBodyText.includes('content security policy') ||
        normalizedBodyText.includes('x-frame-options')
      ) {
        nextErrorType = 'blocked';
      } else if (!iframeSrc || iframeSrc === 'about:blank') {
        nextErrorType = 'blocked';
      }

      if (nextErrorType) {
        setErrorType(nextErrorType);
        return;
      }

      setErrorType('');
    } catch (e) {
      try {
        var checkWin = iframeRef.current && iframeRef.current.contentWindow;
        if (!checkWin) {
          setErrorType('blocked');
          return;
        }
        var checkHref;
        try {
          checkHref = checkWin.location.href;
        } catch (locErr) {
          setErrorType('');
          return;
        }
        if (
          !checkHref ||
          checkHref === 'about:blank' ||
          /^chrome-error:\/\//i.test(checkHref)
        ) {
          setErrorType('blocked');
        } else {
          setErrorType('');
        }
      } catch (innerErr) {
        setErrorType('');
      }
    }
  }

  function onClickOptionItem(item) {
    switch (item) {
      case '关闭':
        onClose();
        break;
      case '主页':
        goHome();
        break;
      case '后退':
        goBack();
        break;
      default:
    }
  }

  return (
    <Div addressInputFocused={addressInputFocused}>
      <section className="ie__toolbar">
        <div className="ie__options">
          <WindowDropDowns
            items={dropDownData}
            onClickItem={onClickOptionItem}
            height={21}
          />
        </div>
        <img className="ie__windows-logo" src={windows} alt="windows" />
      </section>
      <section className="ie__function_bar">
        <div
          onClick={historyIndex <= 0 ? undefined : goBack}
          className={`ie__function_bar__button${
            historyIndex <= 0 ? '--disable' : ''
          }`}
        >
          <img className="ie__function_bar__icon" src={back} alt="" />
          <span className="ie__function_bar__text">后退</span>
          <div className="ie__function_bar__arrow" />
        </div>
        <div
          onClick={
            historyIndex >= historyStack.length - 1 ? undefined : goForward
          }
          className={`ie__function_bar__button${
            historyIndex >= historyStack.length - 1 ? '--disable' : ''
          }`}
        >
          <img className="ie__function_bar__icon" src={forward} alt="" />
          <div className="ie__function_bar__arrow" />
        </div>
        <div
          className={`ie__function_bar__button${loading ? '' : '--disable'}`}
          onClick={loading ? onStop : undefined}
        >
          <img className="ie__function_bar__icon--margin-1" src={stop} alt="" />
        </div>
        <div className="ie__function_bar__button" onClick={onRefresh}>
          <img
            className="ie__function_bar__icon--margin-1"
            src={refresh}
            alt=""
          />
        </div>
        <div className="ie__function_bar__button" onClick={goHome}>
          <img className="ie__function_bar__icon--margin-1" src={home} alt="" />
        </div>
        <div className="ie__function_bar__separate" />
        <div className="ie__function_bar__button">
          <img
            className="ie__function_bar__icon--normalize "
            src={search}
            alt=""
          />
          <span className="ie__function_bar__text">搜索</span>
        </div>
        <div className="ie__function_bar__button">
          <img
            className="ie__function_bar__icon--normalize"
            src={favorite}
            alt=""
          />
          <span className="ie__function_bar__text">收藏夹</span>
        </div>
        <div className="ie__function_bar__button">
          <img className="ie__function_bar__icon--small" src={history} alt="" />
        </div>
        <div className="ie__function_bar__separate" />
        <div className="ie__function_bar__button">
          <img className="ie__function_bar__icon--margin-1" src={mail} alt="" />
          <div className="ie__function_bar__arrow--margin-11" />
        </div>
        <div className="ie__function_bar__button">
          <img
            className="ie__function_bar__icon--margin12"
            src={printer}
            alt=""
          />
        </div>
        <div className="ie__function_bar__button--disable">
          <img className="ie__function_bar__icon--small" src={edit} alt="" />
        </div>
        <div className="ie__function_bar__button">
          <img className="ie__function_bar__icon--margin12" src={msn} alt="" />
        </div>
      </section>
      <section className="ie__address_bar">
        <div className="ie__address_bar__title">地址</div>
        <div className="ie__address_bar__content" ref={addressBarRef}>
          <img src={ie} alt="ie" className="ie__address_bar__content__img" />
          <input
            className="ie__address_bar__content__input"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onFocus={() => {
              setAddressInputFocused(true);
              setShowAddressHistory(true);
            }}
            onBlur={() => {
              setAddressInputFocused(false);
              // 失去焦点时，如果没有发生导航，地址栏应该恢复为当前页面的 URL
              setInputValue(toDisplayUrl(url));
            }}
            onKeyDown={onKeyDown}
            spellCheck={false}
          />
          <button
            type="button"
            className="ie__address_bar__content__dropdown"
            onClick={() => setShowAddressHistory(prev => !prev)}
          >
            <img
              src={dropdown}
              alt="dropdown"
              className="ie__address_bar__content__img"
            />
          </button>
          {showAddressHistory && historyOptions.length > 0 && (
            <div className="ie__address_bar__history">
              {historyOptions.map(historyUrl => (
                <button
                  type="button"
                  key={historyUrl}
                  className="ie__address_bar__history__item"
                  onClick={() => onSelectHistoryUrl(historyUrl)}
                >
                  {historyUrl}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="ie__address_bar__go" onClick={onGo}>
          <img className="ie__address_bar__go__img" src={go} alt="go" />
          <span className="ie__address_bar__go__text">转到</span>
        </div>
        <div className="ie__address_bar__separate" />
        <div className="ie__address_bar__links">
          <span className="ie__address_bar__links__text">链接</span>
          <img
            className="ie__address_bar__links__img"
            src={links}
            alt="links"
          />
        </div>
      </section>
      <div className="ie__content">
        {loading && <div className="ie__loading">正在加载页面...</div>}
        {errorType && (
          <div
            className="ie__error_page"
            dangerouslySetInnerHTML={{
              __html: getErrorPageHtml(url, errorType),
            }}
          />
        )}
        <iframe
          ref={iframeRef}
          className="ie__iframe"
          src={url}
          title="Internet Explorer"
          onLoad={onIframeLoad}
          style={errorType ? { visibility: 'hidden' } : undefined}
        />
      </div>
      <footer className="ie__footer">
        <div className="ie__footer__status">
          <img className="ie__footer__status__img" src={ie} alt="" />
          <span className="ie__footer__status__text">
            {getStatusText(loading, url, errorType)}
          </span>
        </div>
        <div className="ie__footer__block" />
        <div className="ie__footer__block" />
        <div className="ie__footer__block" />
        <div className="ie__footer__block" />
        <div className="ie__footer__right">
          <img className="ie__footer__right__img" src={earth} alt="" />
          <span className="ie__footer__right__text">Internet</span>
          <div className="ie__footer__right__dots" />
        </div>
      </footer>
    </Div>
  );
}

const Div = styled.div`
  height: 100%;
  width: 100%;
  position: absolute;
  display: flex;
  overflow: hidden;
  flex-direction: column;
  background: linear-gradient(to right, #edede5 0%, #ede8cd 100%);

  .ie__toolbar {
    position: relative;
    display: flex;
    align-items: center;
    line-height: 100%;
    height: 24px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.7);
    flex-shrink: 0;
  }
  .ie__options {
    height: 23px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.15);
    border-right: 1px solid rgba(0, 0, 0, 0.15);
    padding-left: 2px;
    flex: 1;
  }
  .ie__windows-logo {
    height: 100%;
    border-left: 1px solid white;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  .ie__function_bar {
    height: 36px;
    display: flex;
    align-items: center;
    font-size: 11px;
    padding: 1px 3px 0;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  .ie__function_bar__button {
    display: flex;
    height: 100%;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0);
    border-radius: 3px;
    cursor: pointer;
    &:hover {
      border: 1px solid rgba(0, 0, 0, 0.1);
      box-shadow: inset 0 -1px 1px rgba(0, 0, 0, 0.1);
    }
    &:hover:active {
      border: 1px solid rgb(185, 185, 185);
      background-color: #dedede;
      box-shadow: inset 0 -1px 1px rgba(255, 255, 255, 0.7);
      color: rgba(255, 255, 255, 0.7);
      & > * {
        transform: translate(1px, 1px);
      }
    }
  }
  .ie__function_bar__button--disable {
    filter: grayscale(1);
    opacity: 0.7;
    display: flex;
    height: 100%;
    align-items: center;
    border: 1px solid rgba(0, 0, 0, 0);
    cursor: default;
    pointer-events: none;
  }
  .ie__function_bar__text {
    margin-right: 4px;
  }
  .ie__function_bar__icon {
    height: 30px;
    width: 30px;
    &--normalize {
      height: 22px;
      width: 22px;
      margin: 0 4px 0 1px;
    }
    &--margin12 {
      height: 22px;
      width: 22px;
      margin: 0 1px 0 2px;
    }
    &--margin-1 {
      margin: 0 -1px;
      height: 22px;
      width: 22px;
    }
    &--small {
      height: 22px;
      width: 22px;
    }
  }
  .ie__function_bar__separate {
    height: 90%;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.2);
    margin: 0 2px;
  }
  .ie__function_bar__arrow {
    height: 100%;
    display: flex;
    align-items: center;
    margin: 0 4px;
    &:before {
      content: '';
      display: block;
      border-width: 3px 3px 0;
      border-color: #000 transparent;
      border-style: solid;
    }
  }
  .ie__function_bar__arrow--margin-11 {
    height: 100%;
    display: flex;
    align-items: center;
    margin: 0 1px 0 -1px;
    &:before {
      content: '';
      display: block;
      border-width: 3px 3px 0;
      border-color: #000 transparent;
      border-style: solid;
    }
  }
  .ie__address_bar {
    border-top: 1px solid rgba(255, 255, 255, 0.7);
    height: 22px;
    font-size: 11px;
    display: flex;
    align-items: center;
    padding: 0 2px 2px;
    box-shadow: inset 0 -2px 3px -1px #2d2d2d;
    flex-shrink: 0;
  }
  .ie__address_bar__title {
    line-height: 100%;
    color: rgba(0, 0, 0, 0.5);
    padding: 5px;
  }
  .ie__address_bar__content {
    border: rgba(122, 122, 255, 0.6) 1px solid;
    box-shadow: ${({ addressInputFocused }) =>
      addressInputFocused ? 'inset 0 0 0 1px #2b72ff' : 'none'};
    height: 100%;
    display: flex;
    flex: 1;
    align-items: center;
    background-color: white;
    position: relative;
    &__img {
      width: 14px;
      height: 14px;
    }
    &__img:first-child {
      margin-left: 2px;
      flex-shrink: 0;
    }
    &__dropdown {
      width: 17px;
      height: 100%;
      border: none;
      background: transparent;
      position: absolute;
      right: 1px;
      padding: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
    &__dropdown:hover img {
      filter: brightness(1.1);
    }
    &__input {
      border: none;
      outline: none;
      font-size: 11px;
      font-family: inherit;
      flex: 1;
      height: 100%;
      padding: 0 22px 0 4px;
      background: transparent;
      min-width: 0;
    }
  }
  .ie__address_bar__history {
    position: absolute;
    left: -1px;
    right: -1px;
    top: calc(100% + 1px);
    background: #fff;
    border: 1px solid #7f9db9;
    border-top: none;
    z-index: 3;
    max-height: 160px;
    overflow-y: auto;
    box-shadow: 1px 1px 0 #fff, 2px 2px 3px rgba(0, 0, 0, 0.2);
  }
  .ie__address_bar__history__item {
    width: 100%;
    border: none;
    background: #fff;
    text-align: left;
    padding: 2px 6px;
    font-size: 11px;
    line-height: 18px;
    font-family: inherit;
    cursor: pointer;
  }
  .ie__address_bar__history__item:hover {
    background: #316ac5;
    color: #fff;
  }
  .ie__address_bar__go {
    display: flex;
    align-items: center;
    padding: 0 18px 0 5px;
    height: 100%;
    position: relative;
    cursor: pointer;
    &__img {
      height: 95%;
      border: 1px solid rgba(255, 255, 255, 0.2);
      margin-right: 3px;
    }
  }
  .ie__address_bar__links {
    display: flex;
    align-items: center;
    padding: 0 18px 0 5px;
    height: 100%;
    position: relative;
    &__img {
      position: absolute;
      right: 2px;
      top: 3px;
      height: 5px;
      width: 8px;
    }
    &__text {
      color: rgba(0, 0, 0, 0.5);
    }
  }
  .ie__address_bar__separate {
    height: 100%;
    width: 1px;
    background-color: rgba(0, 0, 0, 0.1);
    box-shadow: 1px 0 rgba(255, 255, 255, 0.7);
  }
  .ie__content {
    flex: 1;
    overflow: hidden;
    background-color: #f1f1f1;
    position: relative;
  }
  .ie__iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  .ie__error_page {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2;
    overflow: auto;
    background: #fff;
  }
  .ie__loading {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 12px;
    color: #666;
    z-index: 1;
    background: rgba(255, 255, 255, 0.8);
    padding: 10px 20px;
    border-radius: 3px;
  }
  .ie__footer {
    height: 20px;
    border-top: 1px solid transparent;
    box-shadow: inset 0 1px 3px rgba(50, 50, 50, 0.8);
    background-color: rgb(236, 233, 216);
    display: flex;
    align-items: center;
    padding-top: 2px;
    flex-shrink: 0;
  }
  .ie__footer__status {
    flex: 1;
    height: 100%;
    display: flex;
    align-items: center;
    padding-left: 2px;
    &__text {
      font-size: 11px;
    }
    &__img {
      height: 14px;
      width: 14px;
      margin-right: 3px;
    }
  }
  .ie__footer__block {
    height: 85%;
    width: 22px;
    border-left: 1px solid rgba(0, 0, 0, 0.15);
    box-shadow: inset 1px 0 rgba(255, 255, 255, 0.7);
  }
  .ie__footer__right {
    display: flex;
    align-items: center;
    width: 150px;
    height: 80%;
    border-left: 1px solid rgba(0, 0, 0, 0.11);
    box-shadow: inset 1px 0 rgba(255, 255, 255, 0.7);
    padding-left: 5px;
    position: relative;
    &__text {
      font-size: 11px;
    }
    &__img {
      height: 14px;
      width: 14px;
      margin-right: 3px;
    }
    &__dots {
      position: absolute;
      right: 11px;
      bottom: -1px;
      width: 2px;
      height: 2px;
      box-shadow: 2px 0px rgba(0, 0, 0, 0.25), 5.5px 0px rgba(0, 0, 0, 0.25),
        9px 0px rgba(0, 0, 0, 0.25), 5.5px -3.5px rgba(0, 0, 0, 0.25),
        9px -3.5px rgba(0, 0, 0, 0.25), 9px -7px rgba(0, 0, 0, 0.25),
        3px 1px rgba(255, 255, 255, 1), 6.5px 1px rgba(255, 255, 255, 1),
        10px 1px rgba(255, 255, 255, 1), 10px -2.5px rgba(255, 255, 255, 1),
        10px -6px rgba(255, 255, 255, 1);
    }
  }
`;

export default InternetExplorer;
