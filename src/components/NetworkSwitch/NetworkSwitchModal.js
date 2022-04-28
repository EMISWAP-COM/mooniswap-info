import React from 'react';
import {useHistory} from "react-router-dom";

import Modal from '../Modal';
import {Text} from 'rebass';
import styled from 'styled-components/macro';
import CircleCheckIcon from '../../assets/circle-check.svg';
import {networksItems} from "../../helpers/network";
import {useNetworkData} from "../../hooks";

const NetworkSwitchWrapped = styled.div`
  width: 100%;
  padding: 32px 24px 32px 28px;
`;

const NetworkItemsWrap = styled.div`
  display: flex;
  flex-direction: column;
  // align-items: center;
  width: 70%;
  margin: 24px auto 0 auto;
`;

const NetworkItem = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  min-width: 90px;
  margin-bottom: 30px;
  cursor: pointer;
`;

const NetworkIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  margin-right: 15px;
  border: 3px solid ${({theme, active}) => active ? theme.green5 : 'white'};
  border-radius: 4px;
  background: white;
`;
const CircleCheckImg = styled.img`
  position: absolute;
  top: -10px;
  left: 38px;
`;

const NetworkName = styled.div`
  font-size: 16px;
  font-weight: 700;
  text-align: center;
  color: ${({theme, active}) => active ? theme.green5 : 'white'};
`;

export default function NetworkSwitchModal({onClose}) {

  const history = useHistory();

  const {alias} = useNetworkData();

  const onClickItem = async (item) => {
    if (item.alias === alias) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('network', item.network);

    history.push('/home');
    setTimeout(() => {
      window.location.replace(window.location.origin + window.location.pathname + '?' + searchParams);
    }, 200);
  };

  const logosMaxWidths = {
    KUCOIN: '70%',
    AVALANCHE: '70%',
  };

  return (
    <div>
      <Modal
        isOpen={true}
        onDismiss={onClose}
        minHeight={null}
        maxHeight={320}
        maxWidth={480}
      >
        <NetworkSwitchWrapped>
          <div>
            <Text textAlign="center" fontWeight={500} fontSize={20} color="white">Choose Network</Text>
          </div>

          <NetworkItemsWrap>
            {networksItems.map((item, index) => (
              <NetworkItem key={item.alias} onClick={() => onClickItem(item)}>
                <NetworkIcon active={item.alias === alias}>
                  {item.alias === alias && (
                    <CircleCheckImg src={CircleCheckIcon}/>
                  )}
                  <img
                    style={{maxWidth: logosMaxWidths[item.alias] || '100%'}}
                    src={item.icon}
                    alt={item.name}
                  />
                </NetworkIcon>
                <NetworkName active={item.alias === alias}>{item.name}</NetworkName>
              </NetworkItem>
            ))}
          </NetworkItemsWrap>

        </NetworkSwitchWrapped>
      </Modal>
    </div>
  );
}
