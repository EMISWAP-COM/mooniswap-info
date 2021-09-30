import React from 'react';
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

const NetworkItemsRow = styled.div`
  display: flex;
  // justify-content: space-between;
  justify-content: space-around;
  align-items: center;
  width: 70%;
  margin: 24px auto 0 auto;
`;

const NetworkItem = styled.div`
  position: relative;
  cursor: pointer;
  min-width: 100px;
`;

const NetworkIcon = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 48px;
  height: 48px;
  margin: 0 auto 12px auto;
  border: 3px solid ${({theme, active}) => active ? theme.green5 : 'white'};
  border-radius: 4px;
  background: white;
`;
const CircleCheckImg = styled.img`
  position: absolute;
  top: -12px;
  right: 2px;
`;

const NetworkName = styled.div`
  font-size: 16px; 
  font-weight: 500; 
  text-align: center;
  color: ${({theme, active}) => active ? theme.green5 : 'white'};
`;

export default function NetworkSwitchModal({onClose}) {

  const {alias} = useNetworkData();

  const onClickItem = async (item) => {
    if (item.alias === alias) {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    searchParams.set('network', item.network);

    window.location.replace(window.location.origin + window.location.pathname + '?' + searchParams);
  };

  const logosMaxWidths = {
    AVALANCHE: '80%',
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

          <NetworkItemsRow>
            {networksItems.map((item, index) => (
              <NetworkItem key={item.alias} onClick={() => onClickItem(item)}>
                <NetworkIcon active={item.alias === alias}>
                  {item.alias === alias && (
                    <CircleCheckImg src={CircleCheckIcon}/>
                  )}
                  <img
                    style={{ maxWidth: logosMaxWidths[item.alias] || '100%' }}
                    src={item.icon}
                    alt={item.name}
                  />
                </NetworkIcon>
                <NetworkName active={item.alias === alias}>{item.name}</NetworkName>
              </NetworkItem>
            ))}
          </NetworkItemsRow>

        </NetworkSwitchWrapped>
      </Modal>
    </div>
  );
}
