from pydantic import BaseModel

from packages.love.models import LoveStatus


class LoveStatusResponse(BaseModel):
    count: int
    loved: bool

    @classmethod
    def from_status(cls, status: LoveStatus) -> "LoveStatusResponse":
        return cls(count=status.count, loved=status.loved)
