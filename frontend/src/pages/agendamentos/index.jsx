import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiPlus, FiEye, FiEdit2, FiTrash2, FiCalendar } from "react-icons/fi";
import { agendamentosAPI } from "../../services/api/agendamentos";
import Loading from "../../components/ui/Loading";
import StatusBadge from "../../components/ui/StatusBadge";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { formatDateTime } from "../../utils/formatters";
import toast from "react-hot-toast";

export default function Agendamentos() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);

  // Buscar agendamentos do dia selecionado
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["agendamentos", selectedDate],
    queryFn: () => {
      const dataFim = new Date(selectedDate);
      dataFim.setDate(dataFim.getDate() + 1);
      return agendamentosAPI.buscarPorPeriodo(
        selectedDate,
        dataFim.toISOString().split('T')[0]
      );
    },
  });

  const agendamentos = data?.data || [];

  const handleDeleteClick = (agendamento) => {
    setSelectedAgendamento(agendamento);
    setShowDeleteDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await agendamentosAPI.deletar(selectedAgendamento.id);
      toast.success("Agendamento excluído com sucesso!");
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.error || "Erro ao excluir agendamento");
    } finally {
      setShowDeleteDialog(false);
      setSelectedAgendamento(null);
    }
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
  };

  if (isLoading) return <Loading />;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Agendamentos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Gerencie os agendamentos da oficina
          </p>
        </div>
        <Link
          to="/agendamentos/novo"
          className="bg-primary-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700"
        >
          <FiPlus /> Novo Agendamento
        </Link>
      </div>

      {/* Calendário / Seletor de data */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
        <div className="flex items-center gap-4">
          <FiCalendar className="text-gray-400" size={20} />
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="border rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500"
          />
          <span className="text-sm text-gray-500">
            {agendamentos.length} agendamento(s) para este dia
          </span>
        </div>
      </div>

      {/* Lista de Agendamentos */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {agendamentos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Horário
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Veículo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Serviços
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Mecânico
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {agendamentos.map((agendamento) => (
                  <tr key={agendamento.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      {new Date(agendamento.dataHora).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agendamento.cliente?.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agendamento.veiculo?.placa} - {agendamento.veiculo?.marca} {agendamento.veiculo?.modelo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agendamento.servicos?.map(s => s.nome || s).join(', ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {agendamento.mecanico?.nome || 'Não atribuído'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={agendamento.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-3">
                        <Link
                          to={`/agendamentos/${agendamento.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Ver detalhes"
                        >
                          <FiEye size={18} />
                        </Link>
                        <Link
                          to={`/agendamentos/editar/${agendamento.id}`}
                          className="text-green-600 hover:text-green-900"
                          title="Editar"
                        >
                          <FiEdit2 size={18} />
                        </Link>
                        {agendamento.status !== 'CANCELADO' && agendamento.status !== 'CONCLUIDO' && (
                          <button
                            onClick={() => handleDeleteClick(agendamento)}
                            className="text-red-600 hover:text-red-900"
                            title="Excluir"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <FiCalendar className="mx-auto text-gray-400 text-5xl mb-4" />
            <p className="text-gray-500 text-lg">Nenhum agendamento para este dia</p>
            <p className="text-gray-400 text-sm mt-1">
              <Link to="/agendamentos/novo" className="text-primary-600 hover:underline">
                Clique aqui
              </Link> para criar um novo agendamento
            </p>
          </div>
        )}
      </div>

      {/* Dialog de exclusão */}
      <ConfirmDialog
        isOpen={showDeleteDialog}
        title="Excluir Agendamento"
        message={`Tem certeza que deseja excluir o agendamento do dia ${selectedAgendamento ? new Date(selectedAgendamento.dataHora).toLocaleDateString('pt-BR') : ''}?`}
        confirmText="Excluir"
        cancelText="Cancelar"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setShowDeleteDialog(false);
          setSelectedAgendamento(null);
        }}
        type="danger"
      />
    </div>
  );
}