package com.api.pjpPequenosPassos.dto;

import java.util.List;

public class DiarioRequest {

    private Long criancaId;
    private String descricao;
    private String emocao;
    private List<String> fotos; // 🔥 FOTOS AGORA EXISTEM

    public Long getCriancaId() { 
        return criancaId; 
    }
    public void setCriancaId(Long criancaId) { 
        this.criancaId = criancaId; 
    }

    public String getDescricao() { 
        return descricao; 
    }
    public void setDescricao(String descricao) { 
        this.descricao = descricao; 
    }

    public String getEmocao() { 
        return emocao; 
    }
    public void setEmocao(String emocao) { 
        this.emocao = emocao; 
    }

    public List<String> getFotos() { 
        return fotos; 
    }
    public void setFotos(List<String> fotos) { 
        this.fotos = fotos; 
    }
}
