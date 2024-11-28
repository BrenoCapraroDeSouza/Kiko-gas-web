import { useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

import { HeaderActionProps, TabButtonVariant } from '@/@types';
import {
  AddButton,
  ClientCard,
  CylinderCard,
  EmptyList,
  Header,
  HistoricCard,
  List,
  SignalCard,
  Spinner,
} from '@/components';
import { formatCurrency } from '@/helpers';
import { useDashboard, useGetClients, useGetCylinders } from '@/hooks';

import { HISTORIES, REQUESTS } from './mocks';

export function Dashboard() {
  const { currentTab } = useDashboard();
  const { clients, isClientLoading, refreshClients } = useGetClients();
  const { cylinders, isCylindersLoading, refreshCylinders } = useGetCylinders();

  const navigate = useNavigate();

  const isClientTab = currentTab === 'clients';
  const shouldShowAddButton = isClientTab || currentTab === 'cylinders';
  const isLoading = isClientLoading && isCylindersLoading;

  function goToRegisterRoute(): void {
    const route = isClientTab ? 'client' : 'cylinder';
    navigate(`/register/${route}`);
  }

  const renderList = useMemo(() => {
    const lists: Record<TabButtonVariant, React.JSX.Element[]> = {
      clients: clients.map(client => (
        <ClientCard {...client} key={client.id} />
      )),
      cylinders: cylinders.map(cylinder => (
        <CylinderCard
          {...cylinder}
          key={cylinder.id}
          price={formatCurrency(cylinder.price)}
        />
      )),
      historic: HISTORIES.map(historic => (
        <HistoricCard {...historic} key={historic.id} />
      )),
      requests: REQUESTS.map(signal => (
        <SignalCard {...signal} key={signal.id} />
      )),
    };

    if (lists[currentTab].length) return <List>{lists[currentTab]}</List>;

    return <EmptyList />;
  }, [currentTab, clients, cylinders]);

  const actions = useMemo<HeaderActionProps[]>(
    () => [
      {
        key: 'clients',
        variant: 'clients',
      },
      {
        key: 'cylinders',
        variant: 'cylinders',
      },
      {
        key: 'historic',
        variant: 'historic',
      },
      {
        key: 'requests',
        variant: 'requests',
      },
    ],
    [],
  );

  const refreshes = useMemo(
    () => ({
      clients: () => refreshClients(),
      cylinders: () => refreshCylinders(),
      historic: () => {},
      requests: () => {},
    }),
    [refreshClients, refreshCylinders],
  );

  useEffect(() => {
    refreshes[currentTab]();
  }, [currentTab, refreshes]);

  return (
    <main className='flex flex-col w-full h-screen'>
      <Header actions={actions} />

      {isLoading ? (
        <div className='flex w-full h-full justify-center items-center'>
          <Spinner />
        </div>
      ) : (
        <>{renderList}</>
      )}

      {shouldShowAddButton && (
        <AddButton
          variant={isClientTab ? 'user-plus' : 'plus'}
          title={isClientTab ? 'Cadastrar novo cliente' : 'Cadastrar novo gás'}
          onClick={goToRegisterRoute}
        />
      )}
    </main>
  );
}
