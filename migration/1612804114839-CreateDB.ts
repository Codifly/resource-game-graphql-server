import {MigrationInterface, QueryRunner} from "typeorm";

export class CreateDB1612804114839 implements MigrationInterface {
    name = 'CreateDB1612804114839'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "bonus" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying NOT NULL, "availableUntil" TIMESTAMP NOT NULL, "level" integer NOT NULL, "cost" integer NOT NULL, "duration" integer NOT NULL, CONSTRAINT "PK_885c9ca672f42874b1a5cb4d9e7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "lumberyard" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "lumberjack" integer NOT NULL DEFAULT '1', "wood" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '1', "lastGather" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_74a45b03c60713247f069a63e50" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "mine" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "miner" integer NOT NULL DEFAULT '0', "stone" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '1', "lastGather" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_200c63ca703bb95d74c475867b0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "smithy" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "blacksmith" integer NOT NULL DEFAULT '0', "iron" integer NOT NULL DEFAULT '0', "level" integer NOT NULL DEFAULT '1', "lastGather" TIMESTAMP NOT NULL DEFAULT NOW(), CONSTRAINT "PK_00a60100f715f078601f0fab8d1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "hash" character varying NOT NULL, "salt" character varying NOT NULL, "username" character varying NOT NULL, "balance" double precision NOT NULL DEFAULT '0', "mineId" uuid NOT NULL, "lumberyardId" uuid NOT NULL, "smithyId" uuid NOT NULL, "isAdmin" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "REL_c7f575a1d40378794461cb06f2" UNIQUE ("mineId"), CONSTRAINT "REL_cff3a6b0d9222e769912dd7e66" UNIQUE ("lumberyardId"), CONSTRAINT "REL_33a6510676d149c23c31552471" UNIQUE ("smithyId"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_bonus" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "activeUntil" TIMESTAMP NOT NULL, "userId" uuid NOT NULL, "bonusId" uuid NOT NULL, CONSTRAINT "UQ_34fdeb5ba9530eda638132e6644" UNIQUE ("userId", "bonusId"), CONSTRAINT "PK_c92d4306af2ad74375e48bd1ca0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_c7f575a1d40378794461cb06f28" FOREIGN KEY ("mineId") REFERENCES "mine"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_cff3a6b0d9222e769912dd7e663" FOREIGN KEY ("lumberyardId") REFERENCES "lumberyard"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_33a6510676d149c23c315524718" FOREIGN KEY ("smithyId") REFERENCES "smithy"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_bonus" ADD CONSTRAINT "FK_f5701847190a838b1038bb03e81" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_bonus" ADD CONSTRAINT "FK_32a88dad9578ce19678adcb544c" FOREIGN KEY ("bonusId") REFERENCES "bonus"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_bonus" DROP CONSTRAINT "FK_32a88dad9578ce19678adcb544c"`);
        await queryRunner.query(`ALTER TABLE "user_bonus" DROP CONSTRAINT "FK_f5701847190a838b1038bb03e81"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_33a6510676d149c23c315524718"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_cff3a6b0d9222e769912dd7e663"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_c7f575a1d40378794461cb06f28"`);
        await queryRunner.query(`DROP TABLE "user_bonus"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TABLE "smithy"`);
        await queryRunner.query(`DROP TABLE "mine"`);
        await queryRunner.query(`DROP TABLE "lumberyard"`);
        await queryRunner.query(`DROP TABLE "bonus"`);
    }

}
