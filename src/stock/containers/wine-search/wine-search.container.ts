import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy, OnChanges } from '@angular/core';
import { Product, WineComSearchResult } from '../../services/wineCom.service';
import { StockSandbox } from '../../stock.sandbox';
import { FormControl } from '@angular/forms';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';

@Component({
    selector: "wine-search",
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="form-group has-feedback" [class.has-success]="control.valid">
            <label for="searchInput" class="col-sm-4 control-label">
                Name (*)
            </label>
            <div class="col-sm-8">
                <input type="text" class="form-control input-lg" id="searchInput" [formControl]="control"
                    autocomplete="off" placeholder="Name"/>
                <span *ngIf="control.valid" class="glyphicon glyphicon-ok form-control-feedback" aria-hidden="true"></span>
                <ul class="wine-search-results">
                    <li *ngFor="let item of winesToShow$|async" (click)="onSelectWine(item)">
                        <img src="{{item.labels[0].url}}" alt=""/> {{item.name}} 
                    </li>
                </ul>
            </div>
        </div>
    `
})
export class WineSearchContainer implements OnChanges {
    @Input() name: string;
    @Output() selectWine = new EventEmitter<Product>();
    control = new FormControl("");

    private showResults$ = new BehaviorSubject([]);
    private winesToShow$ = this.control.valueChanges
        .do((value: string) => this.showResults$.next([])) // user types, hide the results
        .filter(value => value.length > 2)
        .debounceTime(300)
        .switchMap(value => this.sb.search(value))
        .map((res: WineComSearchResult) => res.products.list)
        .merge(this.showResults$) // Merge the showResults$ stream to clear results at certain moments in time
        .distinctUntilChanged();

    constructor(private sb: StockSandbox) {
    }

    ngOnChanges(): void {
        this.control.setValue(this.name, {emitEvent: false}); // don't call valuechanges again
    }

    onSelectWine(wine: Product): void {
        this.selectWine.emit(wine);
        this.showResults$.next([]);
    }
}