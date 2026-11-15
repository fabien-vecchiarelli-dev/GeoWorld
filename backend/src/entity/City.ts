
 // Représente une ville et le pays auquel elle appartient.

import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from "typeorm";
import { Country } from "./Country";

@Entity("city")
export class City {
    @PrimaryGeneratedColumn()
    cityId: number;

    @Column({ type: "varchar", length: 255 })
    name_city: string;

    @Column({ type: "int", unsigned: true, nullable: true })
    population: number | null;

    @Column({ type: "double", nullable: true })
    latitude: number | null;

    @Column({ type: "double", nullable: true })
    longitude: number | null;

    @ManyToOne(() => Country, country => country.cities, {
        nullable: false,
        onDelete: "NO ACTION",
        onUpdate: "NO ACTION",
    })
    @JoinColumn({
        name: "countryId",
        foreignKeyConstraintName: "FK_city_country",
    })
    country: Country;
}
