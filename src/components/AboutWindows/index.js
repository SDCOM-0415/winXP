import React from 'react';
import styled from 'styled-components';
import windowsLogo from 'assets/windowsIcons/WinXPlogo.svg';

function AboutWindows({ onClose }) {
  return (
    <Content>
      <Banner>
        <BannerLeft>
          <BannerCopy>Copyright</BannerCopy>
          <BannerCopy>© 1985-2001</BannerCopy>
          <BannerCopy>Microsoft</BannerCopy>
          <BannerCopy>Corporation</BannerCopy>
        </BannerLeft>
        <BannerCenter>
          <BannerIcon src={windowsLogo} alt="Windows" />
        </BannerCenter>
        <BannerRight>Microsoft</BannerRight>
      </Banner>
      <OrangeLine />
      <Body>
        <ProductName>Microsoft (R) Windows</ProductName>
        <BodyText>
          版本 5.1 (内部版本号 2600.xpsp_sp3_gdr.080814-1236 :<br />
          Service Pack 3)
        </BodyText>
        <BodyText>版权所有 (C) 2007 Microsoft Corp.</BodyText>
        <LicenseBlock>
          <BodyText>
            本产品符合<LicenseLink>最终用户许可协议</LicenseLink>，授权给：
          </BodyText>
        </LicenseBlock>
        <LicenseeBox>
          <BodyText>SDCOM</BodyText>
          <BodyText>www.sdcom.top</BodyText>
        </LicenseeBox>
        <Divider />
        <SystemInfo>
          <SystemInfoLabel>Windows 的可用物理内存：</SystemInfoLabel>
          <SystemInfoValue>2,096,548 KB</SystemInfoValue>
        </SystemInfo>
        <ButtonRow>
          <OkButton onClick={onClose}>确定</OkButton>
        </ButtonRow>
      </Body>
    </Content>
  );
}

const Content = styled.div`
  padding: 0;
  background: #ece9d8;
  height: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;
  font-family: 'SimSun', '宋体', sans-serif;
  border-left: 1px solid #ece9d8;
  border-right: 1px solid #404040;
  border-bottom: 1px solid #404040;
`;

const Banner = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 85px;
  background: linear-gradient(90deg, #6282d6 0%, #7897e6 56%, #9db6f1 100%);
  padding: 8px 14px 6px 12px;
`;

const BannerLeft = styled.div`
  width: 80px;
  color: #fff;
  font-size: 10px;
  line-height: 1.25;
  align-self: flex-end;
  padding-bottom: 4px;
  font-family: Tahoma, sans-serif;
`;

const BannerCopy = styled.div``;

const BannerCenter = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  padding: 0 4px 0 10px;
`;

const BannerIcon = styled.img`
  width: 210px;
  height: auto;
  object-fit: contain;
`;

const BannerRight = styled.div`
  color: #fff;
  font-size: 12px;
  font-style: italic;
  font-weight: bold;
  align-self: flex-end;
  padding-bottom: 4px;
  font-family: Tahoma, sans-serif;
`;

const OrangeLine = styled.div`
  height: 4px;
  background: linear-gradient(
    90deg,
    #e6dfcf 0%,
    #f19b35 14%,
    #f2a94a 50%,
    #c7b6c1 100%
  );
`;

const Body = styled.div`
  padding: 20px 18px 16px 54px;
  background: #ece9d8;
  flex: 1;
`;

const ProductName = styled.div`
  font-size: 12px;
  color: #000;
  margin-bottom: 16px;
  letter-spacing: 1px;
`;

const BodyText = styled.div`
  font-size: 12px;
  color: #000;
  line-height: 1.6;
  margin-bottom: 16px;
`;

const LicenseBlock = styled.div`
  margin-top: 24px;
`;

const LicenseLink = styled.span`
  color: #1b37b5;
  text-decoration: underline;
`;

const LicenseeBox = styled.div`
  margin-top: 16px;
  margin-left: 16px;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #b9b5a7;
  border-bottom: 1px solid #fff;
  margin: 20px 0 16px;
`;

const SystemInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #000;
`;

const SystemInfoLabel = styled.span`
  margin-right: 12px;
`;

const SystemInfoValue = styled.span``;

const ButtonRow = styled.div`
  display: flex;
  justify-content: flex-end;
  padding-top: 14px;
`;

const OkButton = styled.button`
  min-width: 75px;
  height: 23px;
  background: linear-gradient(to bottom, #f0ede3, #dbd7cb);
  border: 1px solid #003c74;
  border-radius: 3px;
  font-size: 12px;
  cursor: pointer;
  box-shadow: inset 1px 1px 0 #fff, inset -1px -1px 0 #aca899;
  &:hover {
    background: linear-gradient(to bottom, #f5f2e8, #e4e0d4);
  }
  &:active {
    background: linear-gradient(to bottom, #dbd7cb, #f0ede3);
    box-shadow: inset 1px 1px 0 #aca899, inset -1px -1px 0 #fff;
  }
  &:focus {
    outline: 1px dotted #000;
    outline-offset: -4px;
  }
`;

export default AboutWindows;
