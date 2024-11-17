import { Component, inject } from '@angular/core';
import { UiService } from '../../../services/ui.service';
import { InformesService } from '../../../services/informes.service';
import { ComprasService } from '../../../services/compras.service';
import { Compra, CompraDetalle } from '../../../interfaces/compra';
import { NZ_MODAL_DATA, NzModalRef } from 'ng-zorro-antd/modal';
import { FormsModule } from '@angular/forms';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTypographyModule } from 'ng-zorro-antd/typography';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { DatePipe } from '@angular/common';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzPopoverModule } from 'ng-zorro-antd/popover';
import { NzFlexModule } from 'ng-zorro-antd/flex';
import { NzSpinModule } from 'ng-zorro-antd/spin';

@Component({
  selector: 'app-r-compra',
  standalone: true,
  imports: [
    FormsModule,
    NzTableModule,
    NzButtonModule,
    NzTypographyModule,
    NzIconModule,
    DatePipe,
    NzDividerModule,
    NzInputModule,
    NzPopoverModule,
    NzFlexModule,
    NzSpinModule,
    NzFlexModule
  ],
  templateUrl: './r-compra.component.html',
  styleUrl: './r-compra.component.scss'
})
export class RCompraComponent {

  comprasService = inject(ComprasService);
  uiService = inject(UiService);
  informesService = inject(InformesService);
  
  pageSize = 10;
  pageIndex = 1;
  loadingTableData = true;

  displayedCompra: CompraDetalle[] = [];
  dist = '';
  fecha = '';
  obs = '';

  downloading = false;

  readonly #modal = inject(NzModalRef);
  readonly nzModalData: { id: number } = inject(NZ_MODAL_DATA);

  url = '';

  async ngOnInit() {
    await this.get();
  }

  async get(){
    this.loadingTableData = true;
    try {
      const req = await this.comprasService.getOne(this.nzModalData.id);
      console.log(req);
      this.displayedCompra = JSON.parse(JSON.stringify(req.compraDetalles));
      this.dist = req.distribuidor.nombre;
      this.fecha = req.fecha;
      this.obs = req.observacion;
      this.url = req.documentoUrl;
      this.loadingTableData = false;
    } catch (error: any) {
      this.loadingTableData = false;
      this.uiService.showErrorModal('Error al cargar datos', error);
    }
  }

  async download(){
    this.downloading = true;
    try {
      const req = await this.informesService.compraDetalle(this.nzModalData.id);
      const base64Data = req.base64;
      const fileName = req.fileName;

      const url = `data:application/pdf;base64,${base64Data}`;

      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      window.URL.revokeObjectURL(url);
      this.downloading = false;
    } catch (error: any) {
      this.downloading = false;
      this.uiService.showErrorModal('Error al generar informe', error);
    }
  }

}
