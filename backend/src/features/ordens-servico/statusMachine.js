class StatusMachine {
    constructor() {
        // Definição dos estados possíveis
        this.states = {
            ABERTA: 'ABERTA',
            AGUARDANDO_APROVACAO: 'AGUARDANDO_APROVACAO',
            APROVADA: 'APROVADA',
            EM_EXECUCAO: 'EM_EXECUCAO',
            CONCLUIDA: 'CONCLUIDA',
            ENTREGUE: 'ENTREGUE',
            CANCELADA: 'CANCELADA'
        };

        // Definição das transições permitidas
        this.transitions = {
            [this.states.ABERTA]: [
                this.states.AGUARDANDO_APROVACAO,
                this.states.CANCELADA
            ],
            [this.states.AGUARDANDO_APROVACAO]: [
                this.states.APROVADA,
                this.states.ABERTA, // Voltar para edição
                this.states.CANCELADA
            ],
            [this.states.APROVADA]: [
                this.states.EM_EXECUCAO,
                this.states.ABERTA, // Voltar para edição
                this.states.CANCELADA
            ],
            [this.states.EM_EXECUCAO]: [
                this.states.CONCLUIDA,
                this.states.CANCELADA
            ],
            [this.states.CONCLUIDA]: [
                this.states.ENTREGUE,
                this.states.EM_EXECUCAO // Voltar se necessário
            ],
            [this.states.ENTREGUE]: [], // Estado final, não pode mudar
            [this.states.CANCELADA]: []  // Estado final, não pode mudar
        };

        // Regras específicas por tipo de OS
        this.typeRules = {
            ORCAMENTO: {
                allowedTransitions: [
                    this.states.ABERTA,
                    this.states.AGUARDANDO_APROVACAO,
                    this.states.APROVADA,
                    this.states.CANCELADA
                ],
                canExecute: false // Orçamento não pode ser executado
            },
            SERVICO: {
                allowedTransitions: [
                    this.states.ABERTA,
                    this.states.AGUARDANDO_APROVACAO,
                    this.states.APROVADA,
                    this.states.EM_EXECUCAO,
                    this.states.CONCLUIDA,
                    this.states.ENTREGUE,
                    this.states.CANCELADA
                ],
                canExecute: true // Serviço pode ser executado
            }
        };
    }

    // Verificar se uma transição é válida
    canTransition(currentState, newState, tipo = 'SERVICO') {
        // Verificar se os estados existem
        if (!this.states[currentState] || !this.states[newState]) {
            return {
                valid: false,
                message: 'Estado inválido'
            };
        }

        // Verificar regras por tipo
        if (tipo === 'ORCAMENTO' && newState === this.states.EM_EXECUCAO) {
            return {
                valid: false,
                message: 'Orçamentos não podem entrar em execução'
            };
        }

        // Verificar se a transição é permitida
        const allowedTransitions = this.transitions[currentState] || [];
        if (!allowedTransitions.includes(newState)) {
            return {
                valid: false,
                message: `Transição de ${currentState} para ${newState} não é permitida`
            };
        }

        // Regras específicas
        if (currentState === this.states.CONCLUIDA && newState === this.states.EM_EXECUCAO) {
            return {
                valid: true,
                message: 'Retrabalho autorizado',
                requiresAuthorization: true
            };
        }

        return {
            valid: true,
            message: 'Transição permitida'
        };
    }

    // Próximos estados possíveis
    getNextStates(currentState, tipo = 'SERVICO') {
        const allowedTransitions = this.transitions[currentState] || [];

        // Filtrar por tipo
        const typeRules = this.typeRules[tipo] || this.typeRules.SERVICO;
        const nextStates = allowedTransitions.filter(state =>
            typeRules.allowedTransitions.includes(state)
        );

        return nextStates;
    }

    // Verificar se pode adicionar serviços/peças
    canAddItems(status) {
        const editableStates = [
            this.states.ABERTA,
            this.states.AGUARDANDO_APROVACAO,
            this.states.APROVADA
        ];

        return editableStates.includes(status);
    }

    // Verificar se pode executar serviços
    canExecute(status) {
        return status === this.states.EM_EXECUCAO;
    }

    // Verificar se pode faturar
    canInvoice(status) {
        return status === this.states.CONCLUIDA || status === this.states.ENTREGUE;
    }

    // Obter cor do status para UI
    getStatusColor(status) {
        const colors = {
            ABERTA: 'blue',
            AGUARDANDO_APROVACAO: 'yellow',
            APROVADA: 'green',
            EM_EXECUCAO: 'orange',
            CONCLUIDA: 'purple',
            ENTREGUE: 'green',
            CANCELADA: 'red'
        };
        return colors[status] || 'gray';
    }

    // Obter label do status para UI
    getStatusLabel(status) {
        const labels = {
            ABERTA: 'Aberta',
            AGUARDANDO_APROVACAO: 'Aguardando Aprovação',
            APROVADA: 'Aprovada',
            EM_EXECUCAO: 'Em Execução',
            CONCLUIDA: 'Concluída',
            ENTREGUE: 'Entregue',
            CANCELADA: 'Cancelada'
        };
        return labels[status] || status;
    }
}

module.exports = new StatusMachine();