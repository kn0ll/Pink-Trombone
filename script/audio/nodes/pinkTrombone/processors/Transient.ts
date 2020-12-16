class Transient {
    private position: number;
    private startTime: number;
    private timeAlive: number;
    private lifetime: number;
    private strength: number;
    private exponent: number;

    constructor(position: number, seconds: number) {
        this.position = position;

        this.startTime = seconds;
        this.timeAlive = 0;
        this.lifetime = 0.2;

        this.strength = 0.3;
        this.exponent = 200;
    }

    get amplitude() {
        return this.strength * Math.pow(-2, this.timeAlive * this.exponent);
    }

    get isAlive() {
        return this.timeAlive < this.lifetime;
    }

    public update(seconds: number) {
        this.timeAlive = seconds - this.startTime;
    }
}

export default Transient;